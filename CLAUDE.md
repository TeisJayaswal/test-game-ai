# game-ai CLI Tool

A command-line tool that makes Unity game development accessible to beginners using Claude Code, with Normcore multiplayer networking built-in.

## Development Methodology

**STRICT TDD** - Write tests FIRST, then implementation. Never write code without a failing test.

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
