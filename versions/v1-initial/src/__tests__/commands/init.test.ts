import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { initProject } from '../../commands/init.js';
import { isValidUnityProject } from '../../utils/unity.js';

describe('init command', () => {
  const testDir = '/tmp/game-ai-init-test';

  beforeEach(() => {
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  describe('initProject', () => {
    it('creates Unity project directory structure', async () => {
      await initProject('test-game', { cwd: testDir });

      const projectPath = path.join(testDir, 'test-game');
      expect(fs.existsSync(projectPath)).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'Assets'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'ProjectSettings'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'Packages'))).toBe(true);
    });

    it('creates a valid Unity project', async () => {
      await initProject('test-game', { cwd: testDir });

      const projectPath = path.join(testDir, 'test-game');
      expect(isValidUnityProject(projectPath)).toBe(true);
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

    it('adds VR packages when --vr flag is set', async () => {
      await initProject('test-game', { cwd: testDir, vr: true });

      const manifestPath = path.join(testDir, 'test-game', 'Packages', 'manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

      expect(manifest.dependencies['com.unity.xr.interaction.toolkit']).toBeDefined();
      expect(manifest.dependencies['com.unity.inputsystem']).toBeDefined();
    });

    it('throws error if project directory already exists', async () => {
      const projectPath = path.join(testDir, 'existing-project');
      fs.mkdirSync(projectPath);

      await expect(initProject('existing-project', { cwd: testDir })).rejects.toThrow(
        /already exists/i
      );
    });

    it('creates .gitignore file', async () => {
      await initProject('test-game', { cwd: testDir });

      const gitignorePath = path.join(testDir, 'test-game', '.gitignore');
      expect(fs.existsSync(gitignorePath)).toBe(true);

      const content = fs.readFileSync(gitignorePath, 'utf-8');
      expect(content).toContain('[Ll]ibrary/');
      expect(content).toContain('[Tt]emp/');
    });

    it('uses default project name if none provided', async () => {
      await initProject(undefined, { cwd: testDir });

      const projectPath = path.join(testDir, 'my-game');
      expect(fs.existsSync(projectPath)).toBe(true);
    });
  });
});
