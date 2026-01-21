# gamekit

AI-powered Unity game development with Claude. Describe your game, Claude builds it.

## Prerequisites

1. **Unity Hub with Unity installed**
   - Download: https://unity.com/download
   - Install Unity 6 (6000.x) recommended, or Unity 2022.x

2. **Claude Code**
   - Install: https://docs.anthropic.com/en/docs/claude-code
   - (This also installs Node.js which gamekit needs)

## Installation

```bash
npm install -g gamekit-cli
```

Or run directly with npx:

```bash
npx gamekit-cli init
```

## Quick Start

```bash
# Create a new game project
gamekit init

# Follow the prompts:
# 1. Enter your game name
# 2. Select Unity version
# 3. Wait for Unity to open

# Navigate to your project
cd my-game

# Start building with AI
claude
```

Then use `/new-game` to start building:

```
/new-game space shooter where you dodge asteroids and collect power-ups
```

Claude will plan and build it.

## Commands

### `gamekit init`

Interactive wizard that creates a complete game project.

```bash
gamekit init
```

This will:
- Find your Unity installations
- Create a new Unity project
- Install Claude commands, skills, and agents
- Configure MCP for Claude ↔ Unity communication
- Open Unity automatically

### `gamekit create-unity [name]`

Create a Unity project (same as init, but can pass name directly).

```bash
gamekit create-unity my-shooter
```

### `gamekit install-commands`

Install Claude commands to an existing Unity project.

```bash
cd my-existing-project
gamekit install-commands
```

Installs:
- 14 slash commands (`/playtest`, `/build`, `/find-asset`, etc.)
- 18 skills (adding enemies, UI, physics, etc.)
- 6 agents (game-planner, asset-finder, code-debugger, etc.)

### `gamekit configure-mcp`

Generate `.mcp.json` for Claude Code to connect to Unity.

```bash
cd my-project
gamekit configure-mcp
```

### `gamekit doctor`

Diagnose setup issues.

```bash
gamekit doctor
```

Checks:
- Unity installed
- Valid Unity project
- Claude commands installed
- MCP configured
- MCP relay available

## How It Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   You describe  │────▶│  Claude Code    │────▶│     Unity       │
│   your game     │     │  builds it      │     │   runs it       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌─────────────────┐
                        │   Unity MCP     │
                        │ (communication) │
                        └─────────────────┘
```

1. **You** describe what you want in plain English
2. **Claude Code** translates that into Unity implementation
3. **Unity MCP** lets Claude read/modify Unity scenes and scripts
4. **Unity** runs your game

## Project Structure

After running `gamekit init`, your project will have:

```
my-game/
├── .claude/              # Claude configuration
│   ├── CLAUDE.md         # Claude's instructions
│   ├── commands/         # Slash commands
│   ├── skills/           # Game dev skills
│   └── agents/           # Specialized agents
├── .mcp.json             # MCP configuration
├── Assets/               # Unity assets
│   └── _Game/            # Your game files
├── Packages/
│   └── manifest.json     # Unity packages (includes MCP)
└── ProjectSettings/      # Unity settings
```

## Available Slash Commands

Once in your project, you can use these commands with Claude:

| Command | Description |
|---------|-------------|
| `/new-game [description]` | Plan a new game with design doc |
| `/playtest` | Test the game and catch errors |
| `/build [platform]` | Build for Windows, Mac, WebGL |
| `/find-asset [thing]` | Search for free assets |
| `/fix [problem]` | Fix a specific issue |
| `/explain [topic]` | Learn about game concepts |
| `/screenshot` | Capture game view |
| `/rollback` | Undo recent changes |

## Troubleshooting

### Unity not found

Make sure Unity is installed via Unity Hub to the default location:
- **Mac:** `/Applications/Unity/Hub/Editor/`
- **Windows:** `C:\Program Files\Unity\Hub\Editor\`

### MCP relay not found

This is normal before opening Unity. The relay installs when Unity opens and resolves packages. Just open your project in Unity first.

### Claude can't connect to Unity

1. Make sure Unity is open with your project
2. Check that MCP server is running: `Window > Unity MCP > Start Server`
3. Restart Claude Code

## Requirements

- macOS or Windows
- Unity 2022.x or Unity 6 (6000.x)
- Claude Code (includes Node.js)

## License

MIT
