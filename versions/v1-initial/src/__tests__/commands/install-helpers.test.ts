import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { installHelpers } from '../../commands/install-helpers.js';

describe('install-helpers command', () => {
  const testDir = '/tmp/game-ai-install-helpers-test';
  const testProjectPath = path.join(testDir, 'test-unity-project');

  beforeEach(() => {
    // Create a minimal Unity project structure
    fs.mkdirSync(path.join(testProjectPath, 'Assets'), { recursive: true });
    fs.mkdirSync(path.join(testProjectPath, 'Packages'), { recursive: true });
    fs.mkdirSync(path.join(testProjectPath, 'ProjectSettings'), { recursive: true });
    // Create required files for a valid Unity project
    fs.writeFileSync(
      path.join(testProjectPath, 'Packages', 'manifest.json'),
      JSON.stringify({ dependencies: {} })
    );
    fs.writeFileSync(
      path.join(testProjectPath, 'ProjectSettings', 'ProjectVersion.txt'),
      'm_EditorVersion: 2022.3.0f1'
    );
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  describe('installHelpers', () => {
    it('creates .claude directory in project', async () => {
      await installHelpers({ projectPath: testProjectPath });

      expect(fs.existsSync(path.join(testProjectPath, '.claude'))).toBe(true);
    });

    it('creates system_prompt.md file', async () => {
      await installHelpers({ projectPath: testProjectPath });

      const promptPath = path.join(testProjectPath, '.claude', 'system_prompt.md');
      expect(fs.existsSync(promptPath)).toBe(true);

      const content = fs.readFileSync(promptPath, 'utf-8');
      expect(content).toContain('Normcore');
      expect(content).toContain('Unity');
    });

    it('creates commands directory with JSON files', async () => {
      await installHelpers({ projectPath: testProjectPath });

      const commandsDir = path.join(testProjectPath, '.claude', 'commands');
      expect(fs.existsSync(commandsDir)).toBe(true);

      const commands = ['matchmaking.json', 'vr.json', 'sync-object.json', 'build.json'];
      for (const cmd of commands) {
        expect(fs.existsSync(path.join(commandsDir, cmd))).toBe(true);
      }
    });

    it('creates subagents directory with config files', async () => {
      await installHelpers({ projectPath: testProjectPath });

      const subagentsDir = path.join(testProjectPath, '.claude', 'subagents');
      expect(fs.existsSync(subagentsDir)).toBe(true);

      const subagents = ['unity-expert', 'normcore-expert', 'multiplayer-tester'];
      for (const agent of subagents) {
        const configPath = path.join(subagentsDir, agent, 'config.json');
        expect(fs.existsSync(configPath)).toBe(true);
      }
    });

    it('command files contain valid JSON', async () => {
      await installHelpers({ projectPath: testProjectPath });

      const commandsDir = path.join(testProjectPath, '.claude', 'commands');
      const files = fs.readdirSync(commandsDir);

      for (const file of files) {
        const content = fs.readFileSync(path.join(commandsDir, file), 'utf-8');
        expect(() => JSON.parse(content)).not.toThrow();

        const parsed = JSON.parse(content);
        expect(parsed.name).toBeDefined();
        expect(parsed.description).toBeDefined();
        expect(parsed.prompt).toBeDefined();
      }
    });

    it('uses current directory if no projectPath provided', async () => {
      const originalCwd = process.cwd();
      process.chdir(testProjectPath);

      try {
        await installHelpers();
        expect(fs.existsSync(path.join(testProjectPath, '.claude'))).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('throws error if not a Unity project', async () => {
      const nonUnityDir = path.join(testDir, 'not-unity');
      fs.mkdirSync(nonUnityDir, { recursive: true });

      await expect(installHelpers({ projectPath: nonUnityDir })).rejects.toThrow(
        /Unity project/i
      );
    });
  });
});
