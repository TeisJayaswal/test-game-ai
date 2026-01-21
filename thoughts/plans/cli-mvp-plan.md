# game-ai CLI MVP Plan

**Created:** 2026-01-20
**Goal:** Get to feature parity with `fresh-project.md` command, cross-platform

---

## Requirements Summary

1. **One-liner install** - `npx @normal/game-ai` or `npm i -g @normal/game-ai`
2. **`game-ai init`** - Interactive bootstrap in current directory
3. **`game-ai create-unity`** - Create Unity project (finds installs, creates project)
4. **`game-ai install-commands`** - Install Claude commands from git repo
5. **Auto-configure MCP** - Set up Claude Code with Unity MCP
6. **Windows + Mac support** - Cross-platform from day one

---

## Command Architecture

### Command 1: `game-ai init` (Main Entry Point)

Interactive wizard that does everything:

```
$ game-ai init

Welcome to game-ai!

? Project name: my-space-shooter
? Where to create it: /Users/you/Games/my-space-shooter

Finding Unity installations...
  ✓ Unity 6000.1.12f1 (recommended)
  ✓ Unity 2022.3.20f1

? Select Unity version: Unity 6000.1.12f1

Creating Unity project...
  ✓ Project created at /Users/you/Games/my-space-shooter

Installing Claude commands...
  ✓ Downloaded from github.com/anthropics/claude-game-commands
  ✓ Installed to .claude/

Configure MCP for AI coding?
  ✓ Claude Desktop configured
  ✓ Codex configured (optional)

Opening Unity to resolve packages...

✓ Done! Your game is ready.

Next: Open a new terminal in your project and run 'claude'
```

### Command 2: `game-ai create-unity [name]`

Standalone Unity project creation:

```
$ game-ai create-unity space-shooter

Finding Unity installations...
? Select Unity version: Unity 6000.1.12f1
? Normcore App Key: xxxxxxxx

Creating Unity project...
  ✓ Running Unity in batch mode
  ✓ Installing packages (Normcore, Unity MCP)
  ✓ Project created!
```

### Command 3: `game-ai install-commands`

Install/update Claude commands in existing project:

```
$ game-ai install-commands

Downloading latest Claude commands...
  ✓ Fetched from github.com/normalvr/game-ai-commands

Installing to .claude/...
  ✓ Copied commands, skills, agents
  ✓ Installed CLAUDE.md

Done! Claude commands installed.
```

### Command 4: `game-ai configure-mcp`

Auto-configure MCP for Claude:

```
$ game-ai configure-mcp

Configuring Claude Code...
  ✓ Found config at ~/Library/Application Support/Claude/
  ✓ Added unity-mcp server configuration


Done! Restart Claude Code to apply changes.
```

### Command 5: `game-ai doctor` (existing, enhance)

Diagnose everything:

```
$ game-ai doctor

Checking setup...
  ✓ Unity installed (6000.1.12f1)
  ✓ Unity project valid
  ✓ Normcore configured
  ✓ Claude commands installed
  ✓ MCP configured for Claude Code

Run 'game-ai configure-mcp' to fix MCP issues.
```

---

## Technical Implementation

### 1. Unity Discovery (`src/utils/unity.ts`)

Find all Unity installations cross-platform:

```typescript
interface UnityInstall {
  version: string;
  path: string;
  isRecommended: boolean;
}

// Mac: /Applications/Unity/Hub/Editor/*/Unity.app/Contents/MacOS/Unity
// Win: C:\Program Files\Unity\Hub\Editor\*\Editor\Unity.exe

function findUnityInstalls(): UnityInstall[]
function createUnityProject(unityPath: string, projectPath: string): Promise<void>
```

### 2. MCP Configuration (`src/utils/mcp.ts`)

Configure Claude Code and Codex:

```typescript
// Claude Code config locations:
// Mac: ~/Library/Application Support/Claude/claude_desktop_config.json
// Win: %APPDATA%\Claude\claude_desktop_config.json


interface MCPConfig {
  mcpServers: {
    [name: string]: {
      command: string;
      args?: string[];
    }
  }
}

function getClaudeConfigPath(): string
function configureClaudeMCP(projectPath: string): Promise<void>
function configureCodexMCP(projectPath: string): Promise<void>
```

### 3. Commands Copy (`src/utils/commands.ts`)

Copy bundled Claude commands to user project:

```typescript
// Commands are bundled in the npm package at commands-template/.claude/
// Just copy to user's project directory

function getCommandsTemplatePath(): string  // Find bundled commands
function copyCommands(destPath: string): void  // Copy to project
function commandsExist(projectPath: string): boolean  // Check if already installed
```

### 4. Cross-Platform Helpers (`src/utils/platform.ts`)

```typescript
function isWindows(): boolean
function isMac(): boolean
function getHomeDir(): string
function openInExplorer(path: string): void  // Opens Finder/Explorer
function runCommand(cmd: string, args: string[]): Promise<void>
```

---

## File Structure (Updated)

```
game-ai/
├── src/
│   ├── index.ts                 # CLI entry point
│   ├── commands/
│   │   ├── init.ts              # NEW: Main interactive wizard
│   │   ├── create-unity.ts      # NEW: Create Unity project only
│   │   ├── install-commands.ts  # NEW: Copy bundled Claude commands
│   │   ├── configure-mcp.ts     # NEW: Auto-configure MCP
│   │   └── doctor.ts            # ENHANCE: Add MCP checks
│   ├── utils/
│   │   ├── unity.ts             # NEW: Find Unity, create projects
│   │   ├── mcp.ts               # NEW: MCP configuration (+ generate .mcp.json)
│   │   ├── commands.ts          # NEW: Copy bundled commands
│   │   ├── platform.ts          # NEW: Cross-platform helpers
│   │   ├── template.ts          # KEEP: Template copying
│   │   └── normcore.ts          # KEEP: App key injection
│   └── __tests__/
│       └── ...
│
└── template/                    # FULL project template (rename from _template)
    ├── .claude/                 # Claude commands, skills, agents
    │   ├── CLAUDE.md
    │   ├── commands/
    │   ├── skills/
    │   └── agents/
    ├── Assets/
    │   └── _Game/
    │       └── Scripts/
    │           └── Editor/
    │               └── ScreenshotCapture.cs  # Unity editor tools
    ├── Packages/
    │   └── manifest.json        # Pre-configured with Normcore + MCP
    └── .mcp.json.template       # Template - path generated at runtime
```

### Dynamic .mcp.json Generation

The `.mcp.json` file has OS-specific paths and structure:

**Mac:**
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
      "command": "C:\\Users\\USERNAME\\AppData\\Local\\Programs\\CodeMaestro\\UnityMcpRelay\\launch.bat",
      "args": []
    }
  }
}
```

```typescript
// src/utils/mcp.ts

function getMcpLaunchScriptPath(): string {
  if (isMac()) {
    return path.join(os.homedir(), 'Library/Application Support/CodeMaestro/UnityMcpRelay/launch.sh');
  } else if (isWindows()) {
    // Windows: AppData\Local\Programs (NOT Roaming)
    return path.join(process.env.LOCALAPPDATA || '', 'Programs/CodeMaestro/UnityMcpRelay/launch.bat');
  }
  throw new Error('Unsupported platform');
}

function generateMcpConfig(projectPath: string): void {
  const scriptPath = getMcpLaunchScriptPath();

  // Mac uses bash + args, Windows uses direct command
  const config = {
    mcpServers: {
      "advanced-unity-mcp": isMac()
        ? { command: "bash", args: [scriptPath] }
        : { command: scriptPath, args: [] }
    }
  };

  fs.writeFileSync(
    path.join(projectPath, '.mcp.json'),
    JSON.stringify(config, null, 2)
  );
}
```

---

## Implementation Order (TDD)

### Phase 1: Cross-Platform Foundation
1. `src/utils/platform.ts` + tests
2. Verify Windows path handling

### Phase 2: Unity Discovery
3. `src/utils/unity.ts` + tests
4. Find Unity installs (Mac + Windows)
5. Create Unity project via CLI

### Phase 3: MCP Configuration
6. `src/utils/mcp.ts` + tests
7. Configure Claude Desktop
8. Configure Codex (optional)

### Phase 4: Commands Copy
9. `src/utils/commands.ts` + tests
10. Copy bundled commands to user's .claude/

### Phase 5: Commands
12. `src/commands/create-unity.ts` + tests
13. `src/commands/install-commands.ts` + tests
14. `src/commands/configure-mcp.ts` + tests
15. `src/commands/init.ts` + tests (ties it all together)

### Phase 6: Polish
16. Enhance `doctor` command
17. Error messages and recovery
18. Windows testing

---

## Key Decisions

### Q: How to download commands without requiring git?

**A: GitHub tarball API**
```typescript
const tarballUrl = `https://api.github.com/repos/${repo}/tarball/${branch}`;
// Download, extract, copy .claude/ folder
```

This works on Windows without git installed.

### Q: Where do Claude commands live?

**A: Separate public repo**
- `github.com/normalvr/game-ai-commands`
- Contains just the `.claude/` folder contents
- CLI downloads latest on `install-commands`
- Users can fork and customize

### Q: How to handle MCP configuration?

**A: Merge into existing config**
```typescript
// Read existing config
const config = JSON.parse(fs.readFileSync(configPath));

// Add our server (don't overwrite others)
config.mcpServers = config.mcpServers || {};
config.mcpServers['unity-mcp'] = {
  command: 'node',
  args: [path.join(projectPath, 'node_modules', 'unity-mcp', 'index.js')]
};

// Write back
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
```

### Q: What about Normcore app key?

**A: Keep the prompt flow**
- Still prompt for app key during `init` and `create-unity`
- Inject into `NormcoreAppSettings.asset`
- Keep existing `normcore.ts` utility

### Q: What Unity packages to install?

**A: Via manifest.json**
- Unity MCP: `com.anthropic.unity-mcp`
- Normcore: `com.normalvr.normcore`
- Pre-configure in template's `Packages/manifest.json`

---

## Windows-Specific Concerns

1. **Path separators**: Use `path.join()` everywhere
2. **Unity path**: `C:\Program Files\Unity\Hub\Editor\{version}\Editor\Unity.exe`
3. **Claude config**: `%APPDATA%\Claude\claude_desktop_config.json`
4. **Shell commands**: Use `child_process.spawn()` not backticks
5. **Line endings**: Be careful with file operations
6. **Admin rights**: Unity install might be in Program Files

---

## Testing Strategy

### Unit Tests (Vitest)
- Mock filesystem for path tests
- Mock child_process for Unity CLI tests
- Test both Mac and Windows paths

### Integration Tests
- Actually find Unity (if installed)
- Actually create test project (cleanup after)
- Skip on CI if Unity not available

### Manual Testing Checklist
- [ ] Mac: Full init flow
- [ ] Mac: Individual commands
- [ ] Windows: Full init flow
- [ ] Windows: Individual commands
- [ ] Existing project: install-commands only
- [ ] No Unity: Graceful error

---

## Dependencies to Add

No new dependencies needed! Commands are bundled and copied with `fs` operations.

Current dependencies (chalk, commander, inquirer, ora) are sufficient.

---

## Success Criteria

MVP is complete when:

1. ✅ `npx @normal/game-ai init` works on Mac
2. ✅ `npx @normal/game-ai init` works on Windows
3. ✅ Creates working Unity project with Normcore
4. ✅ Installs Claude commands from GitHub
5. ✅ Configures MCP for Claude Desktop
6. ✅ All tests pass
7. ✅ Published to npm

---

## Decisions Made (2026-01-20)

1. **Commands location**: Bundled in this repo
   - Commands live in `commands-template/.claude/` in this repo
   - Published with npm package
   - `install-commands` copies from package to user's project
   - Simpler: no GitHub API, works offline
   - Updates ship with CLI updates

2. **Unity MCP package**: Install via Git URL
   - Add to manifest.json: `"com.codemaestroai.advanced-unity-mcp": "https://github.com/codemaestroai/advanced-unity-mcp.git"`
   - No UPM registry needed

3. **Normcore**: Skipped for MVP
   - Focus on Unity MCP integration first
   - Add Normcore support in future version
   - Simplifies initial setup flow

4. **Codex support**: TBD - need to verify config location

---

## Next Steps

1. ✅ Plan reviewed and decisions made
2. Create `normalvr/game-ai-commands` repo (or decide on exact repo name)
3. Start Phase 1: Platform utilities with TDD
