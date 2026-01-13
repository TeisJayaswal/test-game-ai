# game-ai v2 - Complete Implementation Plan

## Overview

A CLI tool that creates **working multiplayer Unity games** for beginners using Claude Code with Normcore networking.

**Core Philosophy:** Zero to Playing in 5 Minutes. A beginner runs one command, opens Unity, hits Play, and sees a working multiplayer game they can immediately begin modifying with Claude Code.

---

## Technical References (Cache These!)

### Normcore
- **Documentation:** https://normcore.io/documentation
- **Dashboard (signup/app keys):** https://dashboard.normcore.io
- **Package Registry:** https://normcore.io/registry
- **Package Name:** `com.normalvr.normcore`
- **Current Version:** 2.14.0
- **Scoped Registry Config:**
```json
{
  "name": "Normal",
  "url": "https://normcore.io/registry",
  "scopes": ["com.normalvr"]
}
```

### Unity MCP Server
- **Repository:** https://github.com/codemaestroai/advanced-unity-mcp
- **Package URL (Unity 2020-2022):** `https://github.com/codemaestroai/advanced-unity-mcp.git?path=Unity2020_2022`
- **Package URL (Unity 6+):** `https://github.com/codemaestroai/advanced-unity-mcp.git?path=Unity6`
- **Setup:** Install via Unity Package Manager → Add from git URL, then open Code Maestro > MCP Dashboard

### Unity Packages for VR
```json
{
  "com.unity.xr.interaction.toolkit": "3.0.3",
  "com.unity.xr.management": "4.4.0",
  "com.unity.inputsystem": "1.7.0"
}
```

### Asset Sources
- **Kenney (free game assets):** https://kenney.nl/assets
- **Polyhaven API:** https://api.polyhaven.com/assets

---

## Project Structure

```
game-ai/
├── src/
│   ├── index.ts                 # CLI entry point
│   ├── commands/
│   │   ├── create.ts            # Interactive project creation (replaces init)
│   │   ├── doctor.ts            # Diagnose setup issues
│   │   └── learn.ts             # Interactive tutorials
│   ├── templates/
│   │   ├── base/                # Shared files for all templates
│   │   │   ├── .gitignore
│   │   │   ├── README.md
│   │   │   └── .claude/
│   │   │       ├── CLAUDE.md
│   │   │       └── commands/
│   │   ├── third-person/        # Working third-person game
│   │   │   ├── Assets/
│   │   │   ├── Packages/
│   │   │   └── ProjectSettings/
│   │   ├── first-person/        # Working first-person game
│   │   ├── vr/                  # Working VR game
│   │   └── top-down/            # Working top-down game
│   └── utils/
│       ├── unity.ts             # Unity project utilities
│       ├── normcore.ts          # Normcore config utilities
│       └── template.ts          # Template copying/variable substitution
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

---

## Implementation Steps

### Pre-Step: Context Prefetch

Before implementing, fetch and cache these docs in `thoughts/shared/reference/`:

1. **Normcore Quick Start**
   ```
   WebFetch: https://normcore.io/documentation/essentials/getting-started
   Save to: thoughts/shared/reference/normcore-quickstart.md
   ```

2. **Normcore Realtime API**
   ```
   WebFetch: https://normcore.io/documentation/realtime
   Save to: thoughts/shared/reference/normcore-realtime.md
   ```

3. **Unity MCP Capabilities**
   ```
   WebFetch: https://github.com/codemaestroai/advanced-unity-mcp
   Save to: thoughts/shared/reference/unity-mcp.md
   ```

4. **Review existing reference/ folder** - May have cached docs from v1

**Verification:**
- [x] Normcore setup process understood
- [x] MCP installation steps documented
- [x] Ready to implement

---

### Step 0: Project Setup

**Same as v1 but with additional dependencies for interactivity.**

```bash
npm init -y
npm install commander chalk inquirer ora
npm install --save-dev typescript vitest @types/node @types/inquirer ts-node
npx tsc --init
```

**package.json:**
```json
{
  "name": "@normal/game-ai",
  "version": "0.2.0",
  "description": "Create multiplayer Unity games with AI assistance",
  "main": "dist/index.js",
  "bin": {
    "game-ai": "./dist/index.js"
  },
  "type": "module",
  "scripts": {
    "build": "tsc",
    "dev": "ts-node --esm src/index.ts",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "chalk": "^5.3.0",
    "commander": "^12.0.0",
    "inquirer": "^9.2.0",
    "ora": "^8.0.0"
  },
  "devDependencies": {
    "@types/inquirer": "^9.0.0",
    "@types/node": "^20.0.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022",
    "lib": ["ES2022"],
    "types": ["node"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "src/__tests__"]
}
```

**Verification:**
- [x] `npm test` runs
- [x] `npm run build` compiles
- [x] `npm run dev -- --help` shows CLI

---

### Step 1: CLI Foundation

**File: `src/index.ts`**
```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import { createProject } from './commands/create.js';
import { runDoctor } from './commands/doctor.js';
import { runLearn } from './commands/learn.js';

const program = new Command();

program
  .name('game-ai')
  .description('Create multiplayer Unity games with AI assistance')
  .version('0.2.0');

program
  .command('create')
  .description('Create a new multiplayer game project')
  .argument('[name]', 'Project name')
  .action(createProject);

program
  .command('doctor')
  .description('Check your development environment')
  .action(runDoctor);

program
  .command('learn')
  .description('Interactive tutorials for beginners')
  .action(runLearn);

program.parse();
```

**Tests to write:**
- CLI shows help with all commands
- Version number displays correctly

---

### Step 2: Create Command (Interactive)

**File: `src/commands/create.ts`**

Interactive flow using inquirer:

```typescript
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import { createUnityProject } from '../utils/unity.js';
import { validateAppKey } from '../utils/normcore.js';
import { copyTemplate } from '../utils/template.js';

interface CreateAnswers {
  projectName: string;
  gameType: 'third-person' | 'first-person' | 'vr' | 'top-down' | 'empty';
  hasNormcoreAccount: boolean;
  appKey: string;
}

export async function createProject(name?: string): Promise<void> {
  console.log(chalk.blue('\n🎮 Welcome to game-ai! Let\'s create your multiplayer game.\n'));

  const answers = await inquirer.prompt<CreateAnswers>([
    {
      type: 'input',
      name: 'projectName',
      message: 'What do you want to call your game?',
      default: name || 'my-game',
      validate: (input) => {
        if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
          return 'Project name can only contain letters, numbers, dashes, and underscores';
        }
        if (fs.existsSync(input)) {
          return `Directory "${input}" already exists`;
        }
        return true;
      }
    },
    {
      type: 'list',
      name: 'gameType',
      message: 'What kind of game do you want to make?',
      choices: [
        { name: '🏃 Third-person (like Fortnite, Fall Guys)', value: 'third-person' },
        { name: '🔫 First-person (like Minecraft, Portal)', value: 'first-person' },
        { name: '🥽 VR game (Meta Quest, SteamVR)', value: 'vr' },
        { name: '🎲 Top-down (like Among Us, Overcooked)', value: 'top-down' },
        { name: '📦 Empty project (I know what I\'m doing)', value: 'empty' }
      ]
    },
    {
      type: 'confirm',
      name: 'hasNormcoreAccount',
      message: 'Do you have a Normcore account with an App Key?',
      default: false
    },
    {
      type: 'input',
      name: 'appKey',
      message: (answers) => {
        if (!answers.hasNormcoreAccount) {
          console.log(chalk.yellow('\n📝 Let\'s get you set up with Normcore (it\'s free):\n'));
          console.log(chalk.gray('   1. Go to: https://dashboard.normcore.io'));
          console.log(chalk.gray('   2. Sign up for a free account'));
          console.log(chalk.gray('   3. Click "Create App" and give it any name'));
          console.log(chalk.gray('   4. Copy the App Key (starts with "nk_")\n'));
        }
        return 'Paste your Normcore App Key:';
      },
      validate: (input) => {
        if (!input.startsWith('nk_')) {
          return 'App Key should start with "nk_". Check your Normcore dashboard.';
        }
        if (input.length < 10) {
          return 'App Key seems too short. Check your Normcore dashboard.';
        }
        return true;
      }
    }
  ]);

  const spinner = ora('Creating your game...').start();

  try {
    // Create project from template
    spinner.text = 'Setting up project structure...';
    await copyTemplate(answers.gameType, answers.projectName, {
      appKey: answers.appKey,
      projectName: answers.projectName
    });

    // Copy base files (.claude, .gitignore, README)
    spinner.text = 'Adding Claude Code helpers...';
    await copyTemplate('base', answers.projectName, {
      appKey: answers.appKey,
      projectName: answers.projectName
    });

    spinner.succeed(chalk.green('Your game is ready!'));

    // Success message with next steps
    const projectPath = path.resolve(answers.projectName);
    console.log(chalk.blue('\n🎉 Project created successfully!\n'));
    console.log(chalk.white('Next steps:'));
    console.log(chalk.gray(`   1. Open Unity Hub`));
    console.log(chalk.gray(`   2. Click "Add" and select: ${projectPath}`));
    console.log(chalk.gray(`   3. Open the project and wait for packages to import`));
    console.log(chalk.gray(`   4. Open the "Game" scene in Assets/_Game/Scenes/`));
    console.log(chalk.gray(`   5. Press Play - your game should work!`));
    console.log(chalk.yellow('\n💡 Tip: Open the project folder in Claude Code to start building!\n'));

  } catch (error) {
    spinner.fail('Failed to create project');
    throw error;
  }
}
```

**Tests to write:**
- Validates project name format
- Validates App Key format
- Creates correct directory structure
- Copies template files
- Substitutes variables (appKey, projectName)

---

### Step 3: Game Templates

Each template is a working Unity project. Key files detailed below.

#### Third-Person Template Structure

```
templates/third-person/
├── Assets/
│   ├── _Game/
│   │   ├── Prefabs/
│   │   │   └── Player.prefab          # With RealtimeView, RealtimeTransform
│   │   ├── Scenes/
│   │   │   ├── MainMenu.unity         # Room join UI
│   │   │   └── Game.unity             # Main game with Realtime object
│   │   ├── Scripts/
│   │   │   ├── PlayerController.cs    # WASD movement
│   │   │   ├── PlayerSpawner.cs       # Spawns player on connect
│   │   │   ├── RoomManager.cs         # Join/create room logic
│   │   │   └── CameraFollow.cs        # Third-person camera
│   │   └── Materials/
│   │       └── PlayerMaterial.mat
│   └── Resources/
│       └── Player.prefab              # Copy for Realtime.Instantiate
├── Packages/
│   └── manifest.json
└── ProjectSettings/
    ├── ProjectVersion.txt
    └── ProjectSettings.asset
```

#### Key Template Files

**PlayerController.cs:**
```csharp
using UnityEngine;
using Normal.Realtime;

public class PlayerController : MonoBehaviour
{
    [SerializeField] private float moveSpeed = 5f;
    [SerializeField] private float rotateSpeed = 120f;

    private RealtimeView _realtimeView;
    private CharacterController _controller;

    private void Awake()
    {
        _realtimeView = GetComponent<RealtimeView>();
        _controller = GetComponent<CharacterController>();
    }

    private void Update()
    {
        // Only control our own player
        if (!_realtimeView.isOwnedLocallyInHierarchy) return;

        // Get input
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");

        // Rotate
        transform.Rotate(0, horizontal * rotateSpeed * Time.deltaTime, 0);

        // Move
        Vector3 move = transform.forward * vertical * moveSpeed * Time.deltaTime;
        move.y = -9.81f * Time.deltaTime; // Gravity
        _controller.Move(move);
    }
}
```

**PlayerSpawner.cs:**
```csharp
using UnityEngine;
using Normal.Realtime;

public class PlayerSpawner : MonoBehaviour
{
    [SerializeField] private Realtime _realtime;

    private void Awake()
    {
        _realtime.didConnectToRoom += OnConnectedToRoom;
    }

    private void OnDestroy()
    {
        _realtime.didConnectToRoom -= OnConnectedToRoom;
    }

    private void OnConnectedToRoom(Realtime realtime)
    {
        // Spawn player at random position
        Vector3 spawnPos = new Vector3(Random.Range(-3f, 3f), 1f, Random.Range(-3f, 3f));

        Realtime.Instantiate(
            prefabName: "Player",
            position: spawnPos,
            rotation: Quaternion.identity,
            ownedByClient: true,
            preventOwnershipTakeover: true,
            useInstance: _realtime
        );
    }
}
```

**RoomManager.cs:**
```csharp
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using Normal.Realtime;

public class RoomManager : MonoBehaviour
{
    [SerializeField] private Realtime _realtime;
    [SerializeField] private TMP_InputField _roomCodeInput;
    [SerializeField] private Button _joinButton;
    [SerializeField] private Button _createButton;
    [SerializeField] private GameObject _menuPanel;
    [SerializeField] private TMP_Text _statusText;

    private void Start()
    {
        _joinButton.onClick.AddListener(JoinRoom);
        _createButton.onClick.AddListener(CreateRoom);
        _realtime.didConnectToRoom += OnConnected;
    }

    private void JoinRoom()
    {
        string roomCode = _roomCodeInput.text.ToUpper();
        if (string.IsNullOrEmpty(roomCode))
        {
            _statusText.text = "Enter a room code!";
            return;
        }
        _statusText.text = "Joining...";
        _realtime.Connect(roomCode);
    }

    private void CreateRoom()
    {
        string roomCode = GenerateRoomCode();
        _roomCodeInput.text = roomCode;
        _statusText.text = $"Creating room {roomCode}...";
        _realtime.Connect(roomCode);
    }

    private void OnConnected(Realtime realtime)
    {
        _menuPanel.SetActive(false);
        _statusText.text = $"Connected! Room: {realtime.room.name}";
    }

    private string GenerateRoomCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        char[] code = new char[4];
        for (int i = 0; i < 4; i++)
            code[i] = chars[Random.Range(0, chars.Length)];
        return new string(code);
    }
}
```

**Packages/manifest.json:**
```json
{
  "dependencies": {
    "com.normalvr.normcore": "2.14.0",
    "com.unity.textmeshpro": "3.0.6",
    "com.unity.inputsystem": "1.7.0"
  },
  "scopedRegistries": [
    {
      "name": "Normal",
      "url": "https://normcore.io/registry",
      "scopes": ["com.normalvr"]
    }
  ]
}
```

**Tests to write:**
- Template contains all required files
- manifest.json is valid JSON with Normcore
- C# scripts compile (syntax check)
- Variable substitution works ({{APP_KEY}} → actual key)

---

### Step 4: Doctor Command

**File: `src/commands/doctor.ts`**

```typescript
import chalk from 'chalk';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface CheckResult {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  fix?: string;
}

export async function runDoctor(): Promise<void> {
  console.log(chalk.blue('\n🔍 Checking your game development setup...\n'));

  const checks: CheckResult[] = [
    checkNodeVersion(),
    checkUnityHub(),
    checkCurrentDirectory(),
    checkNormcoreConfig(),
  ];

  for (const check of checks) {
    const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌';
    const color = check.status === 'pass' ? chalk.green : check.status === 'warn' ? chalk.yellow : chalk.red;
    console.log(`${icon} ${color(check.name)}: ${check.message}`);
    if (check.fix) {
      console.log(chalk.gray(`   Fix: ${check.fix}`));
    }
  }

  const hasFailures = checks.some(c => c.status === 'fail');
  const hasWarnings = checks.some(c => c.status === 'warn');

  console.log('');
  if (hasFailures) {
    console.log(chalk.red('Some checks failed. Please fix the issues above.'));
  } else if (hasWarnings) {
    console.log(chalk.yellow('Setup looks okay, but there are some warnings.'));
  } else {
    console.log(chalk.green('Everything looks good! You\'re ready to create games.'));
  }
}

function checkNodeVersion(): CheckResult {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);

  if (major >= 18) {
    return { name: 'Node.js', status: 'pass', message: `${version} installed` };
  }
  return {
    name: 'Node.js',
    status: 'fail',
    message: `${version} is too old`,
    fix: 'Install Node.js 18 or newer from https://nodejs.org'
  };
}

function checkUnityHub(): CheckResult {
  const platform = os.platform();
  let hubPath: string;

  if (platform === 'darwin') {
    hubPath = '/Applications/Unity Hub.app';
  } else if (platform === 'win32') {
    hubPath = 'C:\\Program Files\\Unity Hub\\Unity Hub.exe';
  } else {
    hubPath = '/usr/bin/unity-hub';
  }

  if (fs.existsSync(hubPath)) {
    return { name: 'Unity Hub', status: 'pass', message: 'Installed' };
  }
  return {
    name: 'Unity Hub',
    status: 'fail',
    message: 'Not found',
    fix: 'Download Unity Hub from https://unity.com/download'
  };
}

function checkCurrentDirectory(): CheckResult {
  const cwd = process.cwd();
  const hasAssets = fs.existsSync(path.join(cwd, 'Assets'));
  const hasPackages = fs.existsSync(path.join(cwd, 'Packages'));

  if (hasAssets && hasPackages) {
    return { name: 'Unity Project', status: 'pass', message: 'In a Unity project directory' };
  }
  return {
    name: 'Unity Project',
    status: 'warn',
    message: 'Not in a Unity project directory',
    fix: 'Run "game-ai create my-game" to create a new project'
  };
}

function checkNormcoreConfig(): CheckResult {
  const cwd = process.cwd();
  const manifestPath = path.join(cwd, 'Packages', 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    return { name: 'Normcore', status: 'warn', message: 'No Unity project found' };
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  if (manifest.dependencies?.['com.normalvr.normcore']) {
    return { name: 'Normcore', status: 'pass', message: 'Package configured' };
  }
  return {
    name: 'Normcore',
    status: 'fail',
    message: 'Not in manifest.json',
    fix: 'Run "game-ai create" to create a project with Normcore'
  };
}
```

**Tests to write:**
- Node version check works
- Unity project detection works
- Normcore manifest check works

---

### Step 5: Claude Code Helpers (Beginner-Friendly)

**File: `templates/base/.claude/CLAUDE.md`**

```markdown
# {{PROJECT_NAME}} - Your Multiplayer Game

This is a Unity game project with Normcore multiplayer built-in.

## For Claude: How to Help This User

This user is likely NEW to game development. When helping them:

1. **Use simple language** - Say "create a copy of the player" not "instantiate a prefab"
2. **Give step-by-step instructions** - Include what they'll click and see in Unity
3. **Explain the "why"** - Don't just give code, help them understand it
4. **Celebrate wins** - Game dev is hard, acknowledge their progress!

## Project Structure

- `Assets/_Game/` - All game files go here
  - `Scenes/` - Game levels (MainMenu, Game)
  - `Scripts/` - C# code
  - `Prefabs/` - Reusable objects (Player, etc.)
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
1. Open `Assets/_Game/Scripts/PlayerController.cs`
2. Add new input check in Update()
3. The RealtimeTransform handles syncing automatically

### "Add UI"
1. Create Canvas if none exists
2. Add UI elements (Button, Text, etc.)
3. For multiplayer UI (scores, player list), create a RealtimeModel

## Normcore App Key

This project's App Key: {{APP_KEY}}
(Configured in the Realtime object in the Game scene)
```

**File: `templates/base/.claude/commands/add-player.md`**

```markdown
# /add-player

Create a player character that can move around in the game.

## What This Does

Creates a complete player setup with:
- A visible character (capsule by default)
- Movement controls (WASD + mouse look for first-person, WASD for third-person)
- Multiplayer sync (other players see this player move)
- Camera setup appropriate for the game type

## Steps

1. First, check what type of game this is (look at existing camera setup)
2. Create a new Player prefab in Assets/_Game/Prefabs/
3. Add these components:
   - CharacterController (for movement)
   - RealtimeView (for multiplayer)
   - RealtimeTransform (to sync position)
   - PlayerController script (create if needed)
4. Copy the prefab to Assets/Resources/ (required for runtime spawning)
5. Update PlayerSpawner to use the new prefab

## Explain to User

"I'm creating a player character for you. This includes:
- A capsule shape you'll be able to see
- Controls to move with WASD
- Multiplayer sync so other players see you move

After I'm done, press Play and try moving with WASD!"
```

**File: `templates/base/.claude/commands/add-pickup.md`**

```markdown
# /add-pickup

Create an object that players can pick up and interact with.

## What This Does

Creates a pickup object with:
- A visible shape (cube by default)
- Detection for when player gets close
- Pick up / drop functionality
- Multiplayer sync (all players see who has it)

## Steps

1. Create new GameObject with desired shape
2. Add components:
   - Collider (set as Trigger)
   - RealtimeView
   - RealtimeTransform
   - Pickup script (create)
3. Create Pickup.cs with:
   - OnTriggerEnter to detect player
   - Ownership request on pickup
   - Parent to player hand/position
   - Drop on button press
4. Save as prefab in Assets/_Game/Prefabs/

## Explain to User

"I'm creating a pickup object. When your player walks up to it and presses E,
you'll pick it up. Other players will see you holding it too!

The object uses Normcore's ownership system - when you pick it up, you 'own' it,
so your game controls where it goes."
```

**File: `templates/base/.claude/commands/fix.md`**

```markdown
# /fix

Help diagnose and fix problems with the game.

## When User Says This

They're stuck on something. Be helpful and patient.

## Diagnostic Steps

1. **Ask what's happening** - "What did you expect vs what's actually happening?"

2. **Check Console** - Look for red errors in Unity Console
   - NullReferenceException → Something isn't connected in Inspector
   - "Room not found" → Normcore connection issue
   - Pink/magenta objects → Missing material/shader

3. **Common Issues:**

   **"Multiplayer doesn't work"**
   - Is the Normcore App Key set? (Check Realtime object)
   - Are both players using the same room name?
   - Does the prefab have RealtimeView?

   **"Player doesn't move"**
   - Is the script on the player?
   - Is isOwnedLocallyInHierarchy check correct?
   - Is CharacterController present?

   **"Other players don't see my movement"**
   - Does player have RealtimeTransform?
   - Is the prefab in Resources folder?
   - Was it spawned with Realtime.Instantiate?

   **"I see errors when I press Play"**
   - Read the error message carefully
   - Click the error to see which script/line
   - Usually a missing reference in Inspector

4. **If Still Stuck:**
   - Ask user to describe exactly what they did
   - Have them share the specific error message
   - Walk through step by step
```

**File: `templates/base/.claude/commands/explain.md`**

```markdown
# /explain

Explain a Unity or Normcore concept in simple terms.

## How to Explain

Use analogies and simple language. Assume they know NOTHING.

## Common Concepts

**GameObject**
"Think of it like a LEGO brick. By itself it's just a thing in your world.
You add components to give it abilities - like adding wheels makes it a car."

**Component**
"Components are abilities you give to a GameObject. Want it to move? Add a
movement script. Want it to be solid? Add a Collider. They stack up."

**Prefab**
"A prefab is like a template or blueprint. Make one player, save it as a prefab,
now you can create copies. Change the prefab, all copies update too."

**Script**
"A script is instructions written in C#. It tells the game what to do.
'When player presses W, move forward.' You attach scripts to GameObjects."

**RealtimeView (Normcore)**
"This is how Normcore keeps track of things in multiplayer. Put it on anything
that needs to be the 'same' for all players. It's like giving it a phone number
so everyone can stay in sync."

**Ownership (Normcore)**
"In multiplayer, only one player 'owns' each object at a time. The owner's game
controls it, everyone else just sees the updates. Like how only the driver
controls the car, passengers just ride along."

**Room (Normcore)**
"A room is a multiplayer session. Players in the same room can see each other.
Different room name = different game session. It's like a private Discord channel."
```

**Tests to write:**
- All command files exist
- CLAUDE.md has correct structure
- Variable substitution ({{APP_KEY}}) works

---

### Step 6: Template Utilities

**File: `src/utils/template.ts`**

```typescript
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TemplateVariables {
  appKey: string;
  projectName: string;
}

export async function copyTemplate(
  templateName: string,
  destPath: string,
  variables: TemplateVariables
): Promise<void> {
  const templateDir = getTemplateDir(templateName);

  if (!fs.existsSync(templateDir)) {
    throw new Error(`Template "${templateName}" not found`);
  }

  copyDirRecursive(templateDir, destPath, variables);
}

function getTemplateDir(name: string): string {
  // Check both dev and prod paths
  const devPath = path.join(__dirname, '..', 'templates', name);
  const prodPath = path.join(__dirname, '..', '..', 'src', 'templates', name);

  if (fs.existsSync(devPath)) return devPath;
  if (fs.existsSync(prodPath)) return prodPath;

  throw new Error(`Template directory not found: ${name}`);
}

function copyDirRecursive(
  src: string,
  dest: string,
  variables: TemplateVariables
): void {
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath, variables);
    } else {
      let content = fs.readFileSync(srcPath, 'utf-8');

      // Substitute variables
      content = content.replace(/\{\{APP_KEY\}\}/g, variables.appKey);
      content = content.replace(/\{\{PROJECT_NAME\}\}/g, variables.projectName);

      fs.writeFileSync(destPath, content);
    }
  }
}
```

---

### Step 7: Learn Command (Optional Enhancement)

**File: `src/commands/learn.ts`**

```typescript
import inquirer from 'inquirer';
import chalk from 'chalk';

const lessons = {
  basics: {
    title: 'The Basics',
    content: `
${chalk.blue('What is Unity?')}
Unity is a game engine - software for making games. Think of it like
a super-powered art program where your art comes to life and becomes playable.

${chalk.blue('What is Normcore?')}
Normcore handles multiplayer. It's the magic that lets your friend in
another city play the same game with you, seeing the same things in real-time.

${chalk.blue('What is Claude Code?')}
That's me! I can see your Unity project and help you build your game.
Just describe what you want, and I'll help make it happen.
`
  },
  // ... more lessons
};

export async function runLearn(): Promise<void> {
  const { topic } = await inquirer.prompt([
    {
      type: 'list',
      name: 'topic',
      message: 'What would you like to learn about?',
      choices: [
        { name: '🎯 The basics - What is Unity, Normcore, Claude Code?', value: 'basics' },
        { name: '🏃 Adding a player character', value: 'player' },
        { name: '🎨 Adding objects and environments', value: 'objects' },
        { name: '👥 How multiplayer works', value: 'multiplayer' },
        { name: '🔧 Troubleshooting common issues', value: 'troubleshooting' },
      ]
    }
  ]);

  const lesson = lessons[topic as keyof typeof lessons];
  if (lesson) {
    console.log(chalk.blue(`\n📚 ${lesson.title}\n`));
    console.log(lesson.content);
  }
}
```

---

## Testing Strategy

### Unit Tests
```
src/__tests__/
├── commands/
│   ├── create.test.ts      # Test project creation flow
│   └── doctor.test.ts      # Test environment checks
├── utils/
│   ├── template.test.ts    # Test template copying & substitution
│   └── normcore.test.ts    # Test app key validation
└── index.test.ts           # Test CLI commands
```

### Integration Tests
- Full create flow with mocked inquirer responses
- Template produces valid Unity project structure
- Variable substitution works in all files

### Manual Testing Checklist
- [ ] Run `game-ai create test-game` with real interaction
- [ ] Open generated project in Unity
- [ ] Project loads without errors
- [ ] Press Play - game works
- [ ] Open second Unity instance, join same room - see both players
- [ ] Claude Code can read and modify the project

---

## Verification Checkpoints

### After Step 2 (Create Command)
- [ ] Interactive prompts work
- [ ] App key validation works
- [ ] Project directory is created

### After Step 3 (Templates)
- [ ] Template files exist
- [ ] Unity can open generated project
- [ ] Game scene has working Realtime

### After Step 5 (Claude Helpers)
- [ ] CLAUDE.md is helpful for beginners
- [ ] Commands provide useful guidance
- [ ] Variable substitution works

### Final
- [ ] `game-ai create my-game` → working multiplayer game
- [ ] `game-ai doctor` → helpful diagnostics
- [ ] Total time from install to playing < 5 minutes

---

## Key Differences from v1

| Aspect | v1 | v2 |
|--------|-----|-----|
| Main command | `init` (creates empty project) | `create` (interactive, working game) |
| Normcore setup | Manual (app key not configured) | Guided (app key pre-configured) |
| Templates | Empty structure | Working game with scripts |
| Commands | Technical (`/sync-object`) | Beginner (`/add-pickup`) |
| Claude context | Expert-focused | Beginner-focused with empathy |
| Troubleshooting | None | `doctor` command |
| Learning | None | `learn` command |
