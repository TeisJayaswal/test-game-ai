# gamekit UX Guide

User experience details for the gamekit CLI.

## Startup Notifications

These appear at the top of any `gamekit` command before it runs.

### Auto-Update Notification

When the CLI has been updated in the background:
```
✓ Updated to gamekit v0.2.0
```

### Commands Update Notification

When new Claude commands/skills are available:
```
⚡ New commands available! Run `gamekit update-commands` to update.
```

## Installation (`install.sh` / `install.ps1`)

### PATH Prompt

After downloading the binary, prompts to add to PATH (default: Yes):
```
Add to PATH automatically? [Y/n]
```

If yes:
```
Added to ~/.zshrc
Run 'source ~/.zshrc' or restart your terminal to use gamekit
```

## `gamekit init`

### New Project Flow

1. Shows banner:
   ```
   ╔════════════════════════════════════════╗
   ║       🎮 game-ai - Create Game         ║
   ║   AI-powered Unity game development    ║
   ╚════════════════════════════════════════╝
   ```

2. Prompts for project name and Unity version:
   ```
   ? What's your game called? my-shooter
   ? Select Unity version: 6000.0.32f1 (Unity 6 - recommended)
   ```

3. Shows progress with spinners:
   ```
   ✓ Unity project created
   ✓ Claude commands installed
   ✓ MCP package added
   ✓ MCP configured
   ✓ Unity is opening
   ```

4. Waits for MCP with spinner (up to 5 minutes):
   ```
   ⠋ Waiting for Unity to install MCP package... (45s)
   ⠋ MCP relay found, waiting for server to initialize...
   ✓ MCP relay installed and ready
   ```

5. Shows success with next steps:
   ```
   ╔════════════════════════════════════════╗
   ║         ✓ Project Created!             ║
   ╚════════════════════════════════════════╝

   Next steps:

     1. cd my-shooter
        Navigate to your project

     2. ✓ Wait for Unity to finish loading
        Packages installed automatically

     3. claude
        Start building with AI!

   ────────────────────────────────────────────

   Tip: Use /new-game to start building!
   Example: /new-game space shooter where you dodge asteroids
   ```

### Existing Project Flow

When run inside an existing Unity project:

1. Shows different banner:
   ```
   ╔════════════════════════════════════════╗
   ║    🎮 game-ai - Initialize Project     ║
   ║   Adding Claude Code to your project   ║
   ╚════════════════════════════════════════╝

   ✓ Found existing Unity project
   ```

2. If `.claude` exists, prompts:
   ```
   ? Found existing .claude directory. Overwrite? (y/N)
   ```

## `gamekit update-commands`

### Up to Date

```
Checking for command updates...

Installed commands version: 0.1.9
Latest commands version: 0.1.9

✓ Commands are already up to date!
```

### Update Available

```
Checking for command updates...

Installed commands version: 0.1.8
Latest commands version: 0.1.9

Update summary:

  2 new files to add
  5 files to update
  2 files you've modified
```

### Modified File Prompt

For each file the user has modified:
```
You've modified: commands/new-game.md
? What would you like to do? (Use arrow keys)
❯ Keep my version
  Replace with latest
```

### Update Complete

```
Updated:
  ✓ commands/playtest.md
  ✓ commands/build.md
  ✓ skills/new-skill.md

Preserved (your changes kept):
  ⊘ commands/new-game.md
  ⊘ agents/game-planner.md

✓ Updated to v0.1.9
  (2 files preserved)
```

## `gamekit wait-for-mcp`

### Already Ready

```
Checking MCP status...

✓ MCP relay is already installed and ready!

You can now run:
  claude
```

### Waiting

```
Checking MCP status...

MCP relay not found yet. Waiting for Unity to install it...

Make sure Unity is open with your project.

⠋ Waiting for Unity to install MCP package... (30s)
⠋ MCP relay found, waiting for server to initialize...
✓ MCP relay installed and ready

✓ MCP is ready!

You can now run:
  claude
```

### Timeout

```
⚠ MCP relay not found after waiting.

Troubleshooting:
  1. Make sure Unity is open with your project
  2. Check the Unity console for errors
  3. Try: Window > Package Manager > Refresh
```

## `gamekit configure-mcp`

```
Configuring MCP for Claude Code...

Note: .mcp.json already exists and will be overwritten.

✓ Created .mcp.json

✓ Unity MCP relay found

Next steps:
  1. Open the project in Unity (packages will install)
  2. Wait for Unity to finish resolving packages
  3. Run "claude" in this directory to start coding!
```

## `gamekit doctor`

Diagnostic output:
```
gamekit doctor

Checking your setup...

✓ Unity installed (found 2 versions)
✓ Valid Unity project
✓ Claude commands installed
✓ MCP configured (.mcp.json exists)
✓ MCP relay available

All checks passed! You're ready to go.
```

Or with issues:
```
✓ Unity installed (found 2 versions)
✓ Valid Unity project
✗ Claude commands not found
✓ MCP configured (.mcp.json exists)
✗ MCP relay not found

Issues found:
  - Run 'gamekit install-commands' to install Claude commands
  - Open your project in Unity to install the MCP relay
```

## Background Behaviors

### Auto-Update Check

- Runs silently in background on every command
- Checks GitHub releases once per hour (rate limited)
- Downloads and replaces binary if newer version available
- Writes marker file so next run shows notification
- Disable with `GAMEKIT_NO_UPDATE_CHECK=1`

### Commands Version Tracking

- `.claude/.version` stores which CLI version installed commands
- `.claude/.hashes.json` stores SHA256 hashes of original files
- Used to detect user modifications vs clean files

## Spinner Behaviors

All long-running operations use `ora` spinners:
- Spinners animate while waiting
- `✓` (green) = success
- `✗` (red) = failure
- `⚠` (yellow) = warning/timeout
- Elapsed time shown for MCP wait: `(45s)`

## Color Coding

- **Green**: Success, ready, good state
- **Yellow**: Warning, attention needed, user modified
- **Red**: Error, failure
- **Cyan**: Commands, actions to take
- **Gray**: Secondary info, hints, paths
- **Blue**: Section headers, banners
