# game-ai v3 - Complete Implementation Plan

## Overview

A CLI tool that enables **AI-assisted Unity game development** with Normcore multiplayer built-in. The tool sets up:

1. **A working Unity project** with Normcore configured
2. **Unity MCP server** so Claude Code can control Unity Editor
3. **Claude helpers** (custom commands, system prompt, subagents) for guided development

**Core Philosophy:** Zero to AI-Assisted Development in 5 Minutes. User runs commands, opens Unity, and can immediately start building their game with Claude Code as their AI pair programmer.

---

## User Flow

```
# Step 1: Create the Unity project
$ npx @normal/game-ai create my-game
→ Prompts for app key
→ Copies Unity project template
→ Injects app key

# Step 2: Install MCP server (Unity ↔ Claude connection)
$ cd my-game
$ npx @normal/game-ai install-mcp
→ Configures Claude to connect to Unity Editor via MCP

# Step 3: Install Claude helpers
$ npx @normal/game-ai install-helpers
→ Adds .claude/ folder with commands, prompts, subagents

# Now in Claude Code:
> /add-player flying hoverboard character → Claude creates what you describe
> /add-pickup health potion               → Claude creates pickup based on description
> /add-enemy zombie that chases players   → Claude creates enemy with described behavior
> /fix player clips through walls         → Claude fixes the specific problem
> /explain what is a prefab               → Claude explains the concept simply
```

---

## What We Have

- `template/` - Complete Unity 6 project with Normcore 3.0.1 (4.4 MB)

## What We Need to Build

### CLI Commands
| Command | Purpose |
|---------|---------|
| `game-ai create <name>` | Create Unity project with Normcore |
| `game-ai install-mcp` | Install & configure Unity MCP server |
| `game-ai install-helpers` | Install .claude/ directory with helpers |
| `game-ai doctor` | Diagnose setup issues |

### Claude Helpers (`.claude/` directory)
| File | Purpose |
|------|---------|
| `CLAUDE.md` | Beginner-friendly system prompt with context |
| `commands/add-player.md` | `/add-player` - Create a player character |
| `commands/add-pickup.md` | `/add-pickup` - Create objects players can grab |
| `commands/add-enemy.md` | `/add-enemy` - Create enemies/NPCs |
| `commands/fix.md` | `/fix` - Diagnose and fix problems |
| `commands/explain.md` | `/explain` - Explain concepts simply |

---

## Technical References

| Item | Value |
|------|-------|
| Unity Version | 6000.1.12f1 (Unity 6) |
| Normcore Version | 3.0.1 |
| Normcore Registry | `https://normcore-registry.normcore.io` |
| Unity MCP Server | `https://github.com/codemaestroai/advanced-unity-mcp` |
| App Key File | `Assets/Normal/Resources/NormcoreAppSettings.asset` |
| Default Scene | `Assets/Normal/Examples/Hoverbird Player/Realtime + Hoverbird Player.unity` |

### Normcore
- **Documentation:** https://normcore.io/documentation
- **Dashboard (signup/app keys):** https://dashboard.normcore.io
- **Package Registry:** https://normcore.io/registry
---

## Implementation Steps

### Step 1: Project Setup

```bash
npm init -y
npm install commander chalk inquirer ora
npm install -D typescript @types/node @types/inquirer vitest tsx
```

**package.json:**
```json
{
  "name": "@normal/game-ai",
  "version": "0.1.0",
  "description": "AI-powered Unity game development with Normcore",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "game-ai": "./dist/index.js"
  },
  "files": [
    "dist",
    "template",
    "helpers"
  ],
  "scripts": {
    "build": "tsc",
    "dev": "npx tsx src/index.ts",
    "test": "vitest run"
  }
}
```

**Project structure:**
```
game-ai/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── commands/
│   │   ├── create.ts         # Create Unity project
│   │   ├── install-mcp.ts    # Install MCP server
│   │   ├── install-helpers.ts # Install .claude/ helpers
│   │   └── doctor.ts         # Diagnose issues
│   └── utils/
│       ├── template.ts       # Copy template
│       └── normcore.ts       # Inject app key
├── template/                 # Unity project template (already have)
├── helpers/                  # .claude/ directory contents
│   ├── CLAUDE.md
│   ├── commands/
│   └── subagents/
├── package.json
└── tsconfig.json
```

---

### Step 2: CLI Entry Point

**File: `src/index.ts`**

```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import { createProject } from './commands/create.js';
import { installMCP } from './commands/install-mcp.js';
import { installHelpers } from './commands/install-helpers.js';
import { runDoctor } from './commands/doctor.js';

const program = new Command();

program
  .name('game-ai')
  .description('AI-powered Unity game development with Normcore')
  .version('0.1.0');

program
  .command('create')
  .description('Create a new Unity project with Normcore')
  .argument('<name>', 'Project name')
  .action(createProject);

program
  .command('install-mcp')
  .description('Install and configure Unity MCP server for Claude')
  .action(installMCP);

program
  .command('install-helpers')
  .description('Install Claude Code helpers (.claude directory)')
  .action(installHelpers);

program
  .command('doctor')
  .description('Diagnose setup issues')
  .action(runDoctor);

program.parse();
```

---

### Step 3: Create Command

**File: `src/commands/create.ts`**

Copies the Unity template and injects the user's Normcore app key.

```typescript
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import { copyTemplate } from '../utils/template.js';
import { injectAppKey } from '../utils/normcore.js';

export async function createProject(name: string): Promise<void> {
  console.log(chalk.blue('\nWelcome to game-ai!\n'));

  // Check if directory exists
  if (fs.existsSync(name)) {
    console.log(chalk.red(`Directory "${name}" already exists`));
    process.exit(1);
  }

  // Get app key
  const { appKey } = await inquirer.prompt([
    {
      type: 'input',
      name: 'appKey',
      message: () => {
        console.log(chalk.yellow('Get your free Normcore App Key:'));
        console.log(chalk.gray('  1. Go to: https://normcore.io/dashboard'));
        console.log(chalk.gray('  2. Sign up (free)'));
        console.log(chalk.gray('  3. Create an app'));
        console.log(chalk.gray('  4. Copy the App Key\n'));
        return 'Paste your Normcore App Key:';
      },
      validate: (input: string) => input.length > 10 || 'App Key too short'
    }
  ]);

  const spinner = ora('Creating your game...').start();

  try {
    const projectPath = path.resolve(name);

    // Copy template
    spinner.text = 'Copying Unity project...';
    copyTemplate(projectPath);

    // Inject app key
    spinner.text = 'Configuring Normcore...';
    injectAppKey(projectPath, appKey);

    spinner.succeed(chalk.green('Unity project created!'));

    // Next steps
    console.log(chalk.blue('\nNext steps:'));
    console.log(chalk.gray(`  cd ${name}`));
    console.log(chalk.gray('  npx @normal/game-ai install-mcp'));
    console.log(chalk.gray('  npx @normal/game-ai install-helpers'));
    console.log(chalk.gray('\nThen open the project in Unity Hub.\n'));

  } catch (error) {
    spinner.fail('Failed to create project');
    throw error;
  }
}
```

---

### Step 4: Install MCP Command

**File: `src/commands/install-mcp.ts`**

Sets up the Unity MCP server so Claude Code can control Unity Editor.

**MCP Server:** https://github.com/codemaestroai/advanced-unity-mcp

```typescript
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

export async function installMCP(): Promise<void> {
  console.log(chalk.blue('\nInstalling Unity MCP Server...\n'));

  const spinner = ora('Setting up MCP server...').start();

  try {
    // 1. Check we're in a Unity project
    if (!fs.existsSync('Assets') || !fs.existsSync('Packages')) {
      spinner.fail('Not in a Unity project directory');
      console.log(chalk.gray('Run this command from inside your Unity project folder.'));
      process.exit(1);
    }

    // 2. Clone/download MCP server
    const mcpDir = path.join(os.homedir(), '.game-ai', 'unity-mcp');

    if (!fs.existsSync(mcpDir)) {
      spinner.text = 'Downloading Unity MCP server...';
      fs.mkdirSync(path.dirname(mcpDir), { recursive: true });
      execSync(`git clone https://github.com/codemaestroai/advanced-unity-mcp.git "${mcpDir}"`,
        { stdio: 'pipe' });
    }

    // 3. Install MCP server dependencies
    spinner.text = 'Installing MCP dependencies...';
    execSync('npm install', { cwd: mcpDir, stdio: 'pipe' });

    // 4. Build MCP server
    spinner.text = 'Building MCP server...';
    execSync('npm run build', { cwd: mcpDir, stdio: 'pipe' });

    // 5. Configure Claude to use MCP server
    spinner.text = 'Configuring Claude...';
    const claudeConfigPath = getClaudeConfigPath();
    const projectPath = process.cwd();

    let config: any = {};
    if (fs.existsSync(claudeConfigPath)) {
      config = JSON.parse(fs.readFileSync(claudeConfigPath, 'utf-8'));
    }

    config.mcpServers = config.mcpServers || {};
    config.mcpServers.unity = {
      command: 'node',
      args: [path.join(mcpDir, 'build', 'index.js')],
      env: {
        UNITY_PROJECT_PATH: projectPath
      }
    };

    fs.mkdirSync(path.dirname(claudeConfigPath), { recursive: true });
    fs.writeFileSync(claudeConfigPath, JSON.stringify(config, null, 2));

    spinner.succeed(chalk.green('MCP server installed!'));

    console.log(chalk.blue('\nUnity MCP is configured.'));
    console.log(chalk.yellow('\nIMPORTANT: You also need to install the Unity package:'));
    console.log(chalk.gray('  1. Open Unity'));
    console.log(chalk.gray('  2. Window > Package Manager'));
    console.log(chalk.gray('  3. + > Add package from git URL'));
    console.log(chalk.gray('  4. Paste: https://github.com/codemaestroai/advanced-unity-mcp.git?path=Unity6'));
    console.log(chalk.gray('  5. Open: Code Maestro > MCP Dashboard'));
    console.log(chalk.gray('\nThen restart Claude Code.\n'));

  } catch (error) {
    spinner.fail('Failed to install MCP');
    throw error;
  }
}

function getClaudeConfigPath(): string {
  const platform = os.platform();
  if (platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  } else if (platform === 'win32') {
    return path.join(process.env.APPDATA || '', 'Claude', 'claude_desktop_config.json');
  } else {
    return path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json');
  }
}
```

---

### Step 5: Install Helpers Command

**File: `src/commands/install-helpers.ts`**

Copies the `.claude/` directory with system prompt, commands, and subagents.

```typescript
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function installHelpers(): Promise<void> {
  console.log(chalk.blue('\nInstalling Claude Code helpers...\n'));

  const spinner = ora('Copying helpers...').start();

  try {
    // Check we're in a Unity project
    if (!fs.existsSync('Assets')) {
      spinner.fail('Not in a Unity project directory');
      process.exit(1);
    }

    // Copy helpers/ to .claude/
    const helpersPath = path.join(__dirname, '..', '..', 'helpers');
    const destPath = path.join(process.cwd(), '.claude');

    copyDirectorySync(helpersPath, destPath);

    spinner.succeed(chalk.green('Claude helpers installed!'));

    console.log(chalk.blue('\nAvailable commands in Claude Code:'));
    console.log(chalk.gray('  /add-player [description]  - e.g., /add-player flying character'));
    console.log(chalk.gray('  /add-pickup [description]  - e.g., /add-pickup health potion'));
    console.log(chalk.gray('  /add-enemy [description]   - e.g., /add-enemy zombie'));
    console.log(chalk.gray('  /fix [problem]             - e.g., /fix player falls through floor'));
    console.log(chalk.gray('  /explain [concept]         - e.g., /explain what is a prefab\n'));

  } catch (error) {
    spinner.fail('Failed to install helpers');
    throw error;
  }
}

function copyDirectorySync(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirectorySync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
```

---

### Step 6: Claude Helpers Content (Beginner-Friendly)

**File: `helpers/CLAUDE.md`**

```markdown
# Your Multiplayer Game

This is a Unity game project with Normcore multiplayer built-in.

## For Claude: How to Help This User

This user is likely NEW to game development. When helping them:

1. **Use simple language** - Say "create a copy of the player" not "instantiate a prefab"
2. **Give step-by-step instructions** - Include what they'll click and see in Unity
3. **Explain the "why"** - Don't just give code, help them understand it
4. **Celebrate wins** - Game dev is hard, acknowledge their progress!

## Project Structure

- `Assets/Normal/Examples/` - Working example scenes
  - `Hoverbird Player/` - Third-person flying character
  - `Cube Player/` - Simple cube character
  - `VR Player/` - VR multiplayer
- `Assets/Resources/` - Prefabs that spawn at runtime (needed for multiplayer)

## How Multiplayer Works (Simple Version)

1. **Realtime** - The "phone line" connecting players. Lives in the scene.
2. **RealtimeView** - Put this on anything that needs to sync. It's like a name tag.
3. **RealtimeTransform** - Syncs position/rotation. Add this to moving things.
4. **Ownership** - Only ONE player controls each object. Others see the updates.

## Common Tasks

### "Add something the player can pick up"
1. Create a new GameObject (cube, sphere, etc.)
2. Add RealtimeView component
3. Add RealtimeTransform component
4. Create a Pickup.cs script that checks for player collision
5. Put it in Resources/ folder if it needs to spawn at runtime

### "Make the player do something new"
1. Look at the existing player scripts in the example
2. Add new input check in Update()
3. The RealtimeTransform handles syncing automatically

### "Add UI"
1. Create Canvas if none exists
2. Add UI elements (Button, Text, etc.)
3. For multiplayer UI (scores, player list), create a RealtimeModel

## Unity MCP Tools

You have access to Unity Editor via MCP. You can:
- Create/modify GameObjects
- Add/configure components
- Create/modify scripts
- Run play mode
- Create builds

## Normcore Documentation

Full docs: https://normcore.io/documentation
```

**File: `helpers/commands/add-player.md`**

```markdown
# /add-player

Create a player character based on the user's description.

**User's request:** $ARGUMENTS

## What This Does

Creates a player character that matches what the user described. Default (if no description): a simple capsule with WASD movement.

Examples:
- `/add-player` → Basic capsule player with WASD
- `/add-player flying character` → Player with flight controls
- `/add-player knight with sword` → Medieval character with attack
- `/add-player top-down shooter` → Top-down view with shooting

## Steps

1. Read the user's description above and understand what kind of player they want
2. Check existing examples in `Assets/Normal/Examples/` for reference
3. Create a new Player prefab matching their description:
   - Visible character (capsule, or appropriate shape)
   - Movement controls matching the game type (WASD, flight, etc.)
   - Add RealtimeView (for multiplayer)
   - Add RealtimeTransform (to sync position)
   - Create appropriate PlayerController script
4. Copy the prefab to Assets/Resources/ (required for runtime spawning)
5. Make sure there's a PlayerSpawner in the scene

## Explain to User

After creating, tell them:
- What you created based on their description
- How to control the player (WASD, space for jump, etc.)
- How to test it (press Play!)
```

**File: `helpers/commands/add-pickup.md`**

```markdown
# /add-pickup

Create a pickup object based on the user's description.

**User's request:** $ARGUMENTS

## What This Does

Creates a pickup object that matches what the user described. Default: a glowing cube.

Examples:
- `/add-pickup` → Basic glowing cube pickup
- `/add-pickup health potion` → Health restore item
- `/add-pickup coin worth 10 points` → Collectible with score
- `/add-pickup weapon sword` → Weapon the player can use

## Steps

1. Read the user's description above and understand what they want
2. Create new GameObject with appropriate visuals (shape, color, effects)
3. Add components:
   - Collider (set as Trigger)
   - RealtimeView
   - RealtimeTransform
   - Custom Pickup script based on their description
4. If it has special effects (healing, damage, score), implement that logic
5. Save as prefab in Resources/ if it spawns at runtime

## Explain to User

After creating, tell them:
- What pickup you created based on their description
- How to interact with it (walk into it, press E, etc.)
- What effect it has (heals, adds score, equips weapon, etc.)
```

**File: `helpers/commands/add-enemy.md`**

```markdown
# /add-enemy

Create an enemy or NPC based on the user's description.

**User's request:** $ARGUMENTS

## What This Does

Creates an enemy that matches what the user described. Default: a red cube that chases players.

Examples:
- `/add-enemy` → Basic chasing enemy
- `/add-enemy zombie that shambles slowly` → Slow zombie AI
- `/add-enemy turret that shoots at players` → Stationary shooter
- `/add-enemy friendly NPC shopkeeper` → Non-hostile NPC

## Steps

1. Read the user's description above and understand the behavior they want
2. Create enemy GameObject with appropriate visuals
3. Add components:
   - NavMeshAgent (for movement) - if it moves
   - RealtimeView
   - RealtimeTransform
   - Custom EnemyAI script matching their description
   - Health script if it can be damaged
4. Set up NavMesh in scene if not already done
5. Configure behavior (patrol, chase, shoot, friendly, etc.)

## Explain to User

After creating, tell them:
- What enemy/NPC you created based on their description
- How it behaves (chases, patrols, stays still, etc.)
- How to interact with it (attack it, talk to it, avoid it, etc.)
```

**File: `helpers/commands/fix.md`**

```markdown
# /fix

Help diagnose and fix a specific problem the user describes.

**User's problem:** $ARGUMENTS

## What This Does

Helps fix the specific problem the user described. If no description, ask them what's wrong.

Examples:
- `/fix player clips through walls` → Fix collision issues
- `/fix multiplayer not syncing` → Debug Normcore setup
- `/fix error NullReferenceException` → Find the null reference
- `/fix` (no args) → Ask what's happening

## Steps

1. Read the user's problem description above
2. If no description provided, ask: "What's happening? What did you expect vs what you see?"
3. Investigate the specific issue:
   - Use Unity MCP to check Console for errors
   - Check relevant scripts and components
   - Look at Inspector settings

## Common Issues & Fixes

**Collision issues (clips through, doesn't collide)**
- Check Collider component exists
- Check layer collision matrix
- Check rigidbody settings

**Multiplayer not syncing**
- Is App Key set in NormcoreAppSettings?
- Does object have RealtimeView?
- Does object have RealtimeTransform?
- Is prefab in Resources/ folder?

**NullReferenceException**
- Click the error to find the line
- Something in Inspector isn't connected
- A GetComponent failed

**Player doesn't move**
- Check movement script is attached
- Check isOwnedLocallyInHierarchy (Normcore)
- Check Input settings

## Explain the Fix

After fixing, always tell them:
- What was wrong
- What you changed to fix it
- Why this happened (so they learn)
```

**File: `helpers/commands/explain.md`**

```markdown
# /explain

Explain a Unity or Normcore concept in simple terms.

**User wants to understand:** $ARGUMENTS

## What This Does

Explains the concept the user asked about using simple language and analogies.

Examples:
- `/explain what is a prefab` → Explain prefabs with analogies
- `/explain how does multiplayer work` → Explain Normcore sync
- `/explain the code in PlayerController.cs` → Walk through the script
- `/explain` (no args) → Ask what they want to learn about

## How to Explain

1. Read what the user wants to understand above
2. Use simple language - assume they're new to game dev
3. Use real-world analogies
4. Give concrete examples from this project when possible

## Quick Reference (for common concepts)

**GameObject** - "A LEGO brick. By itself it's just a thing. You add components to give it abilities."

**Component** - "Abilities you add to a GameObject. Movement, physics, visuals - each is a component."

**Prefab** - "A template. Make one player, save as prefab, now you can spawn copies."

**Script** - "Instructions in C#. 'When player presses W, move forward.'"

**RealtimeView** - "Normcore's tracking tag. Put on anything that needs to sync between players."

**RealtimeTransform** - "Syncs position/rotation. Add to anything that moves in multiplayer."

**Ownership** - "Only one player controls each object. Owner moves it, others see the movement."

**Room** - "A multiplayer session. Same room name = same game. Like a Discord channel."

## For Code Explanations

If they ask about specific code:
1. Read the file they mention
2. Break it down section by section
3. Explain what each part does in plain English
4. Point out the important parts they should understand
```

---

### Step 7: Doctor Command

**File: `src/commands/doctor.ts`**

```typescript
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export async function runDoctor(): Promise<void> {
  console.log(chalk.blue('\nDiagnosing game-ai setup...\n'));

  const checks = [
    checkUnityProject(),
    checkNormcoreConfig(),
    checkMCPInstalled(),
    checkClaudeHelpers(),
  ];

  let allPassed = true;
  for (const check of checks) {
    const icon = check.passed ? '✓' : '✗';
    const color = check.passed ? chalk.green : chalk.red;
    console.log(`${color(icon)} ${check.name}`);
    if (!check.passed) {
      console.log(chalk.gray(`  ${check.fix}`));
      allPassed = false;
    }
  }

  console.log('');
  if (allPassed) {
    console.log(chalk.green('All checks passed!'));
  } else {
    console.log(chalk.yellow('Some issues found. See above for fixes.'));
  }
}

function checkUnityProject() {
  const passed = fs.existsSync('Assets') && fs.existsSync('Packages');
  return {
    name: 'Unity project',
    passed,
    fix: 'Run this from inside a Unity project, or run: game-ai create my-game'
  };
}

function checkNormcoreConfig() {
  const settingsPath = 'Assets/Normal/Resources/NormcoreAppSettings.asset';
  if (!fs.existsSync(settingsPath)) {
    return { name: 'Normcore configured', passed: false, fix: 'Normcore not found in project' };
  }
  const content = fs.readFileSync(settingsPath, 'utf-8');
  const hasKey = /_normcoreAppKey: .+/.test(content);
  return {
    name: 'Normcore app key',
    passed: hasKey,
    fix: 'Set your app key in the NormcoreAppSettings asset'
  };
}

function checkMCPInstalled() {
  const mcpDir = path.join(os.homedir(), '.game-ai', 'unity-mcp');
  return {
    name: 'MCP server installed',
    passed: fs.existsSync(mcpDir),
    fix: 'Run: game-ai install-mcp'
  };
}

function checkClaudeHelpers() {
  return {
    name: 'Claude helpers installed',
    passed: fs.existsSync('.claude/CLAUDE.md'),
    fix: 'Run: game-ai install-helpers'
  };
}
```

---

## Testing Checklist

### Manual End-to-End

- [ ] `game-ai create test-game` creates Unity project
- [ ] `game-ai install-mcp` sets up MCP server
- [ ] `game-ai install-helpers` copies .claude/ directory
- [ ] `game-ai doctor` reports status correctly
- [ ] Open project in Unity - no errors
- [ ] Open Hoverbird scene, press Play - works
- [ ] In Claude Code, `/add-player` and `/fix` commands work
- [ ] MCP can communicate with Unity Editor

---

## Files to Create

| File | Purpose |
|------|---------|
| `package.json` | NPM config |
| `tsconfig.json` | TypeScript config |
| `src/index.ts` | CLI entry point |
| `src/commands/create.ts` | Create Unity project |
| `src/commands/install-mcp.ts` | Install MCP server |
| `src/commands/install-helpers.ts` | Install .claude/ helpers |
| `src/commands/doctor.ts` | Diagnose issues |
| `src/utils/template.ts` | Copy template |
| `src/utils/normcore.ts` | Inject app key |
| `helpers/CLAUDE.md` | System prompt |
| `helpers/commands/*.md` | Custom commands |
| `helpers/subagents/*.md` | Subagent configs |

---
