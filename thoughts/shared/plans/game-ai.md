# Unity AI Game Dev Toolkit - Implementation Plan for Claude Code

## Project Overview

Build a command-line tool that makes Unity game development accessible to beginners using Claude Code, with Normcore multiplayer networking baked in as the default. The tool should enable someone with zero game dev experience to create a multiplayer VR game in under 10 minutes.

## Technical Architecture

### Core CLI Tool: `game-ai`

**Technology Stack:**
- Node.js (for cross-platform compatibility and npm distribution)
- TypeScript (for type safety and better tooling)
- Commander.js (for CLI structure)
- Chalk (for colored terminal output)
- Inquirer.js (for interactive prompts)

**Distribution:**
- Primary: `npm install -g @normal/game-ai`
- Alternative: `curl -fsSL https://normcore.io/install.sh | sh`

### Repository Structure

```
game-ai/
├── src/
│   ├── commands/
│   │   ├── init.ts           # Initialize new Unity project
│   │   ├── install-mcp.ts    # Install & configure Unity MCP server
│   │   ├── install-helpers.ts # Install Claude Code helpers
│   │   └── update.ts         # Update tooling
│   ├── templates/
│   │   ├── .claude/
│   │   │   ├── system_prompt.md
│   │   │   ├── commands/
│   │   │   │   ├── matchmaking.json
│   │   │   │   ├── vr.json
│   │   │   │   ├── sync-object.json
│   │   │   │   └── build.json
│   │   │   └── subagents/
│   │   │       ├── unity-expert/
│   │   │       ├── normcore-expert/
│   │   │       └── multiplayer-tester/
│   │   └── unity-project/
│   │       ├── Assets/
│   │       ├── ProjectSettings/
│   │       └── Packages/
│   ├── utils/
│   │   ├── unity.ts          # Unity project manipulation
│   │   ├── mcp.ts            # MCP server setup
│   │   ├── normcore.ts       # Normcore integration
│   │   └── assets.ts         # Asset downloading/importing
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Development Methodology: Test-Driven Development (TDD)

**CRITICAL: This project MUST be built using strict TDD practices.**

### TDD Workflow

For every feature/step:
1. **Write the test FIRST** - Define expected behavior before implementation
2. **Run test, see it fail** - Confirms the test is valid
3. **Write minimum code to pass** - No over-engineering
4. **Refactor** - Clean up while tests stay green
5. **Repeat**

### Test Structure

```
src/
├── __tests__/
│   ├── commands/
│   │   ├── init.test.ts
│   │   ├── install-mcp.test.ts
│   │   └── install-helpers.test.ts
│   ├── utils/
│   │   ├── unity.test.ts
│   │   ├── mcp.test.ts
│   │   └── assets.test.ts
│   └── index.test.ts
```

### Test Framework Setup (Do This First!)

```bash
npm install --save-dev vitest @types/node
```

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

### Example TDD Flow for Init Command

**Step 1: Write failing test**
```typescript
// src/__tests__/commands/init.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initProject } from '../../commands/init';
import * as fs from 'fs';
import * as path from 'path';

describe('init command', () => {
  const testDir = '/tmp/game-ai-test';

  beforeEach(() => {
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('creates Unity project directory structure', async () => {
    await initProject('test-game', { cwd: testDir });

    const projectPath = path.join(testDir, 'test-game');
    expect(fs.existsSync(projectPath)).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'Assets'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'ProjectSettings'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'Packages'))).toBe(true);
  });

  it('creates Packages/manifest.json with Normcore', async () => {
    await initProject('test-game', { cwd: testDir });

    const manifestPath = path.join(testDir, 'test-game', 'Packages', 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    expect(manifest.dependencies['com.normalvr.normcore']).toBeDefined();
    expect(manifest.scopedRegistries).toContainEqual(
      expect.objectContaining({ name: 'Normal' })
    );
  });
});
```

**Step 2: Run test, see it fail**
```bash
npm test
# FAIL: initProject is not defined
```

**Step 3: Write minimum code to pass**
```typescript
// src/commands/init.ts
export async function initProject(name: string, options: { cwd?: string } = {}) {
  // Minimal implementation to pass tests
}
```

**Step 4: Refactor and iterate**

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode (recommended during development)
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- src/__tests__/commands/init.test.ts
```

### Coverage Requirements

- Minimum 80% code coverage
- All public functions must have tests
- Edge cases and error handling must be tested

### TDD Checkpoints

Before marking any implementation step complete:
- [ ] All tests for that step are written
- [ ] All tests pass
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] No regressions in existing tests

---

## Implementation Steps

### Pre-Step: Context Prefetch (Do This First!)

**Purpose:** Load key documentation into context to avoid mid-implementation slowdowns.

**Check reference folder first:** `thoughts/shared/reference/` may have cached docs from previous sessions.

Before starting any implementation, fetch and review:

1. **Normcore Documentation**
   ```
   WebFetch: https://docs.normcore.io/
   Prompt: Extract key concepts, API patterns, and code examples for:
   - Setting up Realtime connection
   - RealtimeView and RealtimeTransform usage
   - Creating custom RealtimeComponents
   - Room/matchmaking
   ```

2. **Unity MCP Server**
   ```
   WebFetch: https://github.com/codemaestroai/advanced-unity-mcp
   Prompt: Extract tools/capabilities, installation requirements,
   configuration options, and example usage.
   ```

3. **Review Project Files**
   - Read `CLAUDE.md` for project conventions
   - Read `thoughts/shared/progress.md` for current state
   - Read `thoughts/shared/dev-log.md` for any previous issues

4. **Verify Setup**
   - Confirm `.claude/settings.json` permissions are loaded
   - Confirm agents are available: tdd-runner, typescript-builder, etc.

**Verification:**
- [ ] Normcore docs loaded (know how to set up Realtime, sync objects)
- [ ] MCP capabilities understood (know what Unity operations are available)
- [ ] Project context loaded (CLAUDE.md, progress.md read)
- [ ] Ready to begin Step 0

---

### Step 0: Project Setup and Test Infrastructure

**This step MUST be completed first before any other implementation.**

```bash
# Initialize npm project
npm init -y

# Install dependencies
npm install commander chalk inquirer

# Install dev dependencies
npm install --save-dev typescript vitest @types/node ts-node

# Initialize TypeScript
npx tsc --init
```

**package.json scripts:**
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Verification:**
- [ ] `npm test` runs (even with 0 tests initially)
- [ ] `npm run build` compiles successfully
- [ ] `npm run dev -- --help` shows CLI help

---

### Step 1: CLI Tool Foundation

**File: `src/index.ts`**
```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import { initProject } from './commands/init';
import { installMCP } from './commands/install-mcp';
import { installHelpers } from './commands/install-helpers';
import { updateTool } from './commands/update';

const program = new Command();

program
  .name('game-ai')
  .description('AI-powered Unity game development toolkit with Normcore')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize a new Unity project with AI tooling')
  .argument('[project-name]', 'Name of the project')
  .option('-v, --vr', 'Set up for VR development')
  .option('-m, --multiplayer', 'Include multiplayer setup (default: true)')
  .action(initProject);

program
  .command('install-mcp')
  .description('Install and configure Unity MCP server')
  .action(installMCP);

program
  .command('install-helpers')
  .description('Install Claude Code helpers (.claude directory)')
  .action(installHelpers);

program
  .command('update')
  .description('Update game-ai tooling to latest version')
  .action(updateTool);

program.parse();
```

### Step 2: Project Initialization Command

**File: `src/commands/init.ts`**

Requirements:
1. Create Unity project directory structure
2. Generate basic Unity project files (ProjectSettings, Packages/manifest.json)
3. Install Normcore package
4. Set up .claude/ directory with helpers
5. Configure Unity MCP server
6. Create starter scene with multiplayer setup

Implementation checklist:
- [ ] Prompt user for project name and settings
- [ ] Create directory structure
- [ ] Generate Unity project files (ProjectVersion.txt, ProjectSettings)
- [ ] Add Normcore to Packages/manifest.json with scoped registry
- [ ] Copy .claude/ template directory
- [ ] Run `install-mcp` and `install-helpers` automatically
- [ ] Create initial scene with Normcore Realtime component
- [ ] Initialize git repository
- [ ] Display success message with next steps

**Normcore Package Integration:**
```json
// Packages/manifest.json template
{
  "dependencies": {
    "com.normalvr.normcore": "2.14.0",
    "com.unity.xr.interaction.toolkit": "3.0.3",
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

### Step 3: Unity MCP Server Installation

**File: `src/commands/install-mcp.ts`**

**MCP Server Repository:** https://github.com/codemaestroai/advanced-unity-mcp

Requirements:
1. Clone/download the MCP server
2. Install dependencies (npm install in MCP server directory)
3. Configure Claude Desktop/Code to use the MCP server
4. Test connection

Implementation checklist:
- [ ] Check if MCP server is already installed
- [ ] Clone advanced-unity-mcp repository
- [ ] Run npm install in MCP directory
- [ ] Detect Claude configuration file location:
  - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
  - Windows: `%APPDATA%/Claude/claude_desktop_config.json`
  - Linux: `~/.config/Claude/claude_desktop_config.json`
- [ ] Add MCP server to Claude config:
```json
{
  "mcpServers": {
    "unity": {
      "command": "node",
      "args": ["/path/to/advanced-unity-mcp/build/index.js"],
      "env": {
        "UNITY_PROJECT_PATH": "/path/to/current/project"
      }
    }
  }
}
```
- [ ] Prompt user to restart Claude
- [ ] Provide test command to verify MCP connection

### Step 4: Claude Code Helpers System

**File: `src/commands/install-helpers.ts`**

Creates `.claude/` directory with:

#### 4.1: System Prompt (`templates/.claude/system_prompt.md`)

```markdown
# Unity Game Development with Normcore

You are an expert Unity game developer specializing in multiplayer VR games using Normcore.

## Project Structure
This Unity project uses:
- **Normcore**: For multiplayer networking (https://normcore.io/documentation)
- **Unity XR Interaction Toolkit**: For VR interactions
- **Unity Input System**: For modern input handling

## Key Principles
1. Always use Normcore's `RealtimeView` and `RealtimeTransform` for synchronized objects
2. Prefer composition over inheritance in Unity components
3. Keep network traffic minimal - only sync what's necessary
4. Test multiplayer functionality early and often

## Normcore Patterns

### Basic Multiplayer Setup
Every multiplayer scene needs:
1. Realtime component (singleton, manages connection)
2. RealtimeView on synchronized GameObjects
3. RealtimeTransform for position/rotation sync
4. Custom RealtimeComponent<T> for game-specific state

### Synchronizing Objects
```csharp
// Add these components to any GameObject that needs multiplayer sync:
// 1. RealtimeView
// 2. RealtimeTransform (for position/rotation)
// 3. Custom RealtimeComponent for game-specific properties
```

## Available Custom Commands
- `/matchmaking` - Implement matchmaking system
- `/vr` - Set up VR player rig with locomotion
- `/sync-object` - Make selected object multiplayer-synced
- `/build` - Create build for testing

## Asset Resources
- Kenney.nl: https://kenney.nl/assets (free game assets)
- Polyhaven: https://api.polyhaven.com/assets (free 3D assets/textures)

## Unity MCP Tools
You have access to Unity Editor via MCP tools for:
- Creating GameObjects in scenes
- Adding/configuring components
- Making builds
- Running play mode tests
```

#### 4.2: Custom Commands

**File: `templates/.claude/commands/matchmaking.json`**
```json
{
  "name": "matchmaking",
  "description": "Implement multiplayer matchmaking with Normcore",
  "prompt": "I need to implement a matchmaking system for my game. Please:\n\n1. Create a MatchmakingManager script that uses Normcore's Quickmatch API\n3. Set up UI for the matchmaking flow\n4. Add the MatchmakingManager to the appropriate scene\n5. Explain how players will connect to each other\n\nUse Normcore's best practices for room management and connection handling."
}
```

**File: `templates/.claude/commands/vr.json`**
```json
{
  "name": "vr",
  "description": "Set up VR player rig with proper locomotion",
  "prompt": "Set up a VR player rig for this game. Please:\n\n1. Create XR Rig with camera and controllers\n2. Add locomotion (teleport and/or continuous movement)\n3. Add interaction system (grab, UI pointer, etc.)\n4. Make the rig multiplayer-ready with Normcore (RealtimeView, RealtimeAvatar)\n5. Add avatar representation for other players\n6. Test that VR input works\n\nUse Unity's XR Interaction Toolkit and Normcore's multiplayer components."
}
```

**File: `templates/.claude/commands/sync-object.json`**
```json
{
  "name": "sync-object",
  "description": "Make a GameObject multiplayer-synced with Normcore",
  "prompt": "I want to make this GameObject synchronized across multiplayer. Please:\n\n1. Ask me which GameObject(s) to sync\n2. Add RealtimeView component\n3. Add RealtimeTransform for position/rotation sync\n4. Ask if I need custom property sync (e.g., color, health, state)\n5. If yes, create a custom RealtimeComponent<T> for the properties\n6. Explain the ownership model and how changes will sync\n\nFollow Normcore's synchronization patterns and best practices."
}
```

**File: `templates/.claude/commands/build.json`**
```json
{
  "name": "build",
  "description": "Create a build for testing",
  "prompt": "Create a build of this game for testing. Please:\n\n1. Ask what platform to build for (Windows, macOS, Linux, Android/Quest)\n2. Set up build settings appropriately\n3. Use Unity MCP to trigger the build\n4. Report build location and any warnings/errors\n5. If VR, remind about device setup requirements\n\nUse Unity's BuildPipeline API via MCP tools."
}
```

#### 4.3: Subagents

**File: `templates/.claude/subagents/unity-expert/config.json`**
```json
{
  "name": "unity-expert",
  "description": "Expert in Unity architecture and C# patterns",
  "system_prompt": "You are a Unity architecture expert. Focus on:\n- Component-based design patterns\n- Performance optimization\n- Unity lifecycle (Awake, Start, Update, FixedUpdate)\n- MonoBehaviour best practices\n- ScriptableObjects for data\n\nAlways explain WHY you recommend certain patterns, not just WHAT to do."
}
```

**File: `templates/.claude/subagents/normcore-expert/config.json`**
```json
{
  "name": "normcore-expert",
  "description": "Expert in Normcore multiplayer networking",
  "system_prompt": "You are a Normcore multiplayer networking expert. Focus on:\n- Realtime/RealtimeView/RealtimeComponent patterns\n- Network ownership and authority\n- State synchronization strategies\n- Room/connection management\n- Performance optimization for multiplayer\n- Debugging networking issues\n\nRefer to Normcore documentation: https://normcore.io/documentation"
}
```

**File: `templates/.claude/subagents/multiplayer-tester/config.json`**
```json
{
  "name": "multiplayer-tester",
  "description": "Tests multiplayer functionality and identifies issues",
  "system_prompt": "You are a multiplayer testing specialist. When testing:\n- Simulate multiple clients connecting\n- Test ownership transfer scenarios\n- Verify state synchronization\n- Check for race conditions\n- Test disconnection/reconnection\n- Identify network performance issues\n\nProvide detailed test reports with reproduction steps for any bugs found."
}
```

### Step 5: Asset Integration Utilities

**File: `src/utils/assets.ts`**

Requirements:
- Download assets from Kenney.nl
- Fetch assets from Polyhaven API
- Import assets into Unity project
- Organize assets in proper folder structure

Implementation checklist:
- [ ] Create asset downloader for Kenney.nl
- [ ] Integrate Polyhaven API client
- [ ] Implement asset importer (copy to Assets/ folder)
- [ ] Set up import settings for different asset types
- [ ] Create asset manifest tracking what's been imported

### Step 6: Demo Project Template

Create a starter template that showcases:
- Basic multiplayer scene with Normcore
- VR player rig (if VR enabled)
- Simple interactive object (grabbable, synced)
- Matchmaking UI
- High-quality visuals (proper lighting, assets)

**Starter Scene Components:**
1. Realtime GameObject (manages connection)
2. Player spawn points
3. Sample synced objects (cube, sphere with physics)
4. Simple environment (floor, walls with good materials)
5. Lighting setup (baked GI, reflection probes)

## Testing Checklist

Before considering the tool complete:

### Unit Tests
- [ ] CLI commands parse correctly
- [ ] Unity project structure is created properly
- [ ] Packages/manifest.json is valid JSON
- [ ] .claude directory is copied correctly
- [ ] MCP server config is written properly

### Integration Tests
- [ ] `game-ai init test-project` creates working Unity project
- [ ] Unity Editor can open the generated project
- [ ] Normcore package is installed correctly
- [ ] MCP server connects to Unity Editor
- [ ] Claude Code can execute Unity MCP commands
- [ ] Custom commands appear in Claude Code
- [ ] Subagents can be invoked

### User Acceptance Tests
- [ ] Complete beginner can follow README and create project
- [ ] Created project opens in Unity without errors
- [ ] Multiplayer test scene works with 2 clients
- [ ] Build process completes successfully
- [ ] VR mode works (if enabled)

## MVP Definition

The minimum viable product should enable:

1. **One command setup**: `game-ai init my-game --vr`
2. **MCP integration**: Claude Code can manipulate Unity Editor
3. **Working starter scene**: Multiplayer-enabled scene that runs
4. **Basic commands**: At least `/matchmaking`, `/vr`, `/sync-object` working
5. **Documentation**: README that a beginner can follow

## Success Criteria

The tool is ready for launch when:
- [ ] A non-Unity developer can create a multiplayer VR game in < 15 minutes
- [ ] The demo project looks visually polished (not "programmer art")
- [ ] All custom commands work reliably
- [ ] MCP integration is stable
- [ ] Documentation is comprehensive and tested
- [ ] GitHub repo is public with good README, examples, and contribution guidelines

## Next Steps for Claude Code

1. **Start with CLI foundation**: Build the basic Commander.js structure in TypeScript
2. **Implement `init` command**: Focus on creating valid Unity project structure
3. **Add Normcore integration**: Package manifest with scoped registry
4. **Build MCP installer**: Automate advanced-unity-mcp setup
5. **Create Claude helpers**: Build out .claude/ directory templates
6. **Test end-to-end**: Verify complete workflow works
7. **Polish and document**: README, examples, troubleshooting guide

## Resources

- Unity MCP Server: https://github.com/codemaestroai/advanced-unity-mcp
- Normcore Documentation: https://normcore.io/documentation
- Kenney Assets: https://kenney.nl/assets
- Polyhaven API: https://api.polyhaven.com/assets
- Unity Manual: https://docs.unity3d.com/Manual/index.html
- XR Interaction Toolkit: https://docs.unity3d.com/Packages/com.unity.xr.interaction.toolkit@3.0/manual/index.html
