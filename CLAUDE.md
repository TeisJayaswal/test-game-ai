# game-ai CLI Tool

A command-line tool that makes Unity game development accessible to beginners using Claude Code, with Normcore multiplayer networking built-in.

## Development Methodology

**STRICT TDD** - Write tests FIRST, then implementation. Never write code without a failing test.

### Testing Priority

Testing is a top priority for this project:
- Always write tests for new functionality before implementing
- Run `npm test` before committing to ensure all tests pass
- When adding new utility functions, add corresponding tests in `src/__tests__/`
- Tests should cover both happy paths and edge cases
- If you find untested code, add tests before modifying it

## Commands

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm run build         # Compile TypeScript
npm run dev -- --help # Run CLI in development
npx tsc --noEmit      # Type check only
```

## Project Structure

```
src/
├── commands/         # CLI command implementations
│   ├── init.ts
│   ├── install-mcp.ts
│   ├── install-helpers.ts
│   └── update.ts
├── templates/        # Files copied to user projects
│   ├── .claude/
│   └── unity-project/
├── utils/            # Shared utilities
│   ├── unity.ts
│   ├── mcp.ts
│   ├── normcore.ts
│   └── assets.ts
├── __tests__/        # Test files (mirror src structure)
└── index.ts          # CLI entry point
```

## Conventions

- Use Vitest for testing
- Use Commander.js for CLI
- Use Chalk for colored output
- Use Inquirer.js for prompts
- All async functions should be properly typed
- Error handling: throw errors, let CLI handle display

## Unity Project Structure (for templates)

A valid Unity project needs:
```
ProjectName/
├── Assets/           # Game content
├── Packages/
│   └── manifest.json # Package dependencies
├── ProjectSettings/
│   ├── ProjectVersion.txt
│   └── ProjectSettings.asset
└── .claude/          # Claude Code helpers (our addition)
```

## Key Dependencies

- commander: CLI framework
- chalk: Terminal colors
- inquirer: Interactive prompts
- typescript: Type safety
- vitest: Testing framework

## Releasing

When creating a new release:
1. Update `version` in package.json BEFORE creating the tag (so the version shows correctly in the built binary)
2. Commit the version bump
3. Create and push the git tag (e.g., `git tag v0.1.9 && git push origin v0.1.9`)

## Auto-Update System

The CLI has a built-in auto-update system:

**Binary updates:**
- Checks GitHub releases once per hour (in background, non-blocking)
- Downloads and replaces binary automatically
- Shows `✓ Updated to gamekit vX.X.X` on next run
- Disable with `GAMEKIT_NO_UPDATE_CHECK=1` env var
- Logs activity to `~/.gamekit/update.log`

**Commands/skills updates:**
- The `.claude` folder is versioned separately (`.claude/.version` file)
- Shows `⚡ New commands available!` when CLI is newer than installed commands
- Users run `gamekit update-commands` to update
- Warning: This overwrites the entire `.claude` folder (user changes will be lost)

