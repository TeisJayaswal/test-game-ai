# gamekit-cli Architecture

This document explains the architectural decisions for the gamekit CLI tool.

## Overview

gamekit-cli is a command-line tool that helps developers create Unity game projects pre-configured with Claude Code integration and Unity MCP.

## Distribution Strategy

### Decision: npm Package with Background Auto-Update

We chose to distribute gamekit-cli as an npm package rather than a compiled binary.

#### Alternatives Considered

| Approach | Pros | Cons |
|----------|------|------|
| **Rust binary** | Fast, small, no runtime | Hard to maintain, different language |
| **Bun bundle** | Single file, fast | Memory leaks, large bundles |
| **Go binary** | Fast, easy cross-compile | Different language from codebase |
| **npm package** ✓ | Simple, users have Node.js if they are using Claude Code | Requires Node.js runtime |

#### Why npm?

1. **Users already have Node.js** - Claude Code requires Node.js, so our users already have it installed
2. **Simple distribution** - `npm install -g gamekit-cli` just works
3. **Easy updates** - npm handles versioning and updates
4. **Same language** - TypeScript codebase, no context switching
5. **Cross-platform** - Works on Mac, Windows, and WSL out of the box

### Auto-Update System

The CLI includes a background auto-update system that:

1. **Doesn't block the user** - Update checks happen in a detached subprocess
2. **Rate-limited** - Only checks once per hour (stored in `~/.gamekit/last-update-check`)
3. **Applies on next run** - Updates install via `npm install -g`, ready for next execution
4. **Logs activity** - Update history stored in `~/.gamekit/update.log`

```
┌─────────────────────────────────────────────────────────────┐
│                     User runs: gamekit init                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐         ┌─────────────────────────┐   │
│  │   Main CLI      │         │  Background Process     │   │
│  │   (blocking)    │         │  (detached, async)      │   │
│  ├─────────────────┤         ├─────────────────────────┤   │
│  │ 1. Start CLI    │────────▶│ 1. Check npm registry   │   │
│  │ 2. Run command  │         │ 2. Compare versions     │   │
│  │ 3. Exit         │         │ 3. If newer: npm update │   │
│  └─────────────────┘         │ 4. Log result           │   │
│         │                    └─────────────────────────┘   │
│         │                              │                    │
│         ▼                              ▼                    │
│  User sees output              Update installed            │
│  immediately                   for next run                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Update Flow

```typescript
// On CLI startup (index.ts)
maybeCheckForUpdates();  // Non-blocking

// maybeCheckForUpdates():
// 1. Check if we've checked in the last hour
// 2. If not, spawn detached process:
//    - Fetch https://registry.npmjs.org/gamekit-cli/latest
//    - Compare with current version
//    - If newer: npm install -g gamekit-cli@latest
//    - Log result to ~/.gamekit/update.log
```

#### Files

- `~/.gamekit/last-update-check` - Timestamp of last check (rate limiting)
- `~/.gamekit/update.log` - History of update checks and results

## Project Structure

```
gamekit-cli/
├── src/
│   ├── index.ts              # CLI entry point + update trigger
│   ├── commands/
│   │   ├── init.ts           # Interactive project wizard
│   │   ├── create-unity.ts   # Create Unity project
│   │   ├── install-commands.ts
│   │   ├── configure-mcp.ts
│   │   └── doctor.ts
│   └── utils/
│       ├── platform.ts       # Cross-platform helpers
│       ├── unity.ts          # Unity discovery & project creation
│       ├── mcp.ts            # MCP configuration generation
│       ├── commands.ts       # Claude commands copy
│       ├── template.ts       # Template utilities
│       └── updater.ts        # Background auto-update
│
├── template/                  # Bundled with npm package
│   ├── .claude/              # Claude commands, skills, agents
│   ├── Assets/               # Unity assets (editor scripts)
│   └── Packages/manifest.json
│
└── dist/                      # Compiled JavaScript
```

## Cross-Platform Support

### Platforms Supported

- macOS (Intel & Apple Silicon)
- Windows (native & WSL)

### Platform-Specific Paths

| Resource | macOS | Windows |
|----------|-------|---------|
| Unity Hub | `/Applications/Unity/Hub/Editor/` | `C:\Program Files\Unity\Hub\Editor\` |
| MCP Relay | `~/Library/Application Support/CodeMaestro/UnityMcpRelay/launch.sh` | `%LOCALAPPDATA%\Programs\CodeMaestro\UnityMcpRelay\launch.bat` |
| Config dir | `~/.gamekit/` | `%USERPROFILE%\.gamekit\` |

### MCP Configuration

The `.mcp.json` file has different structures per platform:

**macOS:**
```json
{
  "mcpServers": {
    "advanced-unity-mcp": {
      "command": "bash",
      "args": ["~/Library/Application Support/CodeMaestro/UnityMcpRelay/launch.sh"]
    }
  }
}
```

**Windows:**
```json
{
  "mcpServers": {
    "advanced-unity-mcp": {
      "command": "C:\\Users\\...\\AppData\\Local\\Programs\\CodeMaestro\\UnityMcpRelay\\launch.bat",
      "args": []
    }
  }
}
```

## Unity Integration

### Unity Discovery

The CLI scans standard Unity Hub installation paths:

```typescript
// Mac
/Applications/Unity/Hub/Editor/*/Unity.app/Contents/MacOS/Unity

// Windows
C:\Program Files\Unity\Hub\Editor\*\Editor\Unity.exe
```

### Unity Version Detection

Parses version strings like `6000.1.12f1` and `2022.3.20f1`:

- Unity 6 = version starting with `6000`
- Unity 2022/2021/etc = version starting with year

### MCP Package URL

Different Unity versions need different MCP package paths:

```typescript
// Unity 6+
https://github.com/codemaestroai/advanced-unity-mcp.git?path=Unity6

// Unity 2020-2022
https://github.com/codemaestroai/advanced-unity-mcp.git?path=Unity2020_2022
```

## Testing Strategy

### Unit Tests (Vitest)

- `platform.test.ts` - Cross-platform path helpers
- `unity.test.ts` - Unity discovery and version parsing
- `mcp.test.ts` - MCP configuration generation
- `commands.test.ts` - Claude commands copy
- `template.test.ts` - Template utilities
- `updater.test.ts` - Version comparison

### Manual Testing

- [ ] Mac: Full init flow
- [ ] Windows native: Full init flow
- [ ] Windows WSL: Full init flow
- [ ] Existing project: install-commands
- [ ] No Unity: Graceful error

## Security Considerations

1. **Path traversal prevention** - Project names validated with regex `/^[a-zA-Z0-9_-]+$/`
2. **Symlink skipping** - Template copy skips symlinks
3. **No shell injection** - Commands use spawn with arrays, not shell strings
4. **Update verification** - Updates come from official npm registry only

## Future Considerations

### Potential Improvements

1. **Offline support** - Cache last known version, skip update check if offline
2. **Update notifications** - Show "New version available" message instead of silent update
3. **Rollback** - Keep previous version, allow `gamekit rollback`
4. **Faster startup** - Lazy load modules only when needed

### Migration Path to Binary

If npm distribution proves problematic, we could:

1. **Deno compile** - Same TypeScript, compiles to binary
2. **pkg** - Bundle Node.js into executable
3. **Bun build** - If memory leaks are fixed

The architecture is modular enough that the core logic (utils/) would remain unchanged.
