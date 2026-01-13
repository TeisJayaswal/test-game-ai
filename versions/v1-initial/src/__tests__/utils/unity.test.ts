import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  isValidUnityProject,
  createUnityProjectStructure,
  getProjectVersion,
} from '../../utils/unity.js';

describe('Unity utilities', () => {
  const testDir = '/tmp/game-ai-unity-test';

  beforeEach(() => {
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  describe('isValidUnityProject', () => {
    it('returns false for empty directory', () => {
      expect(isValidUnityProject(testDir)).toBe(false);
    });

    it('returns false for directory with only some required folders', () => {
      fs.mkdirSync(path.join(testDir, 'Assets'));
      expect(isValidUnityProject(testDir)).toBe(false);
    });

    it('returns true for valid Unity project structure', () => {
      // Create minimal Unity project structure
      fs.mkdirSync(path.join(testDir, 'Assets'));
      fs.mkdirSync(path.join(testDir, 'Packages'));
      fs.mkdirSync(path.join(testDir, 'ProjectSettings'));
      fs.writeFileSync(
        path.join(testDir, 'Packages', 'manifest.json'),
        '{}'
      );
      fs.writeFileSync(
        path.join(testDir, 'ProjectSettings', 'ProjectVersion.txt'),
        'm_EditorVersion: 2022.3.0f1'
      );

      expect(isValidUnityProject(testDir)).toBe(true);
    });
  });

  describe('createUnityProjectStructure', () => {
    it('creates Assets, Packages, and ProjectSettings directories', async () => {
      const projectPath = path.join(testDir, 'my-game');
      await createUnityProjectStructure(projectPath);

      expect(fs.existsSync(path.join(projectPath, 'Assets'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'Packages'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'ProjectSettings'))).toBe(true);
    });

    it('creates Packages/manifest.json with Normcore dependency', async () => {
      const projectPath = path.join(testDir, 'my-game');
      await createUnityProjectStructure(projectPath);

      const manifestPath = path.join(projectPath, 'Packages', 'manifest.json');
      expect(fs.existsSync(manifestPath)).toBe(true);

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      expect(manifest.dependencies['com.normalvr.normcore']).toBeDefined();
    });

    it('creates Packages/manifest.json with Normal scoped registry', async () => {
      const projectPath = path.join(testDir, 'my-game');
      await createUnityProjectStructure(projectPath);

      const manifestPath = path.join(projectPath, 'Packages', 'manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

      expect(manifest.scopedRegistries).toBeDefined();
      expect(manifest.scopedRegistries).toContainEqual(
        expect.objectContaining({
          name: 'Normal',
          url: 'https://normcore.io/registry',
        })
      );
    });

    it('creates ProjectSettings/ProjectVersion.txt', async () => {
      const projectPath = path.join(testDir, 'my-game');
      await createUnityProjectStructure(projectPath);

      const versionPath = path.join(projectPath, 'ProjectSettings', 'ProjectVersion.txt');
      expect(fs.existsSync(versionPath)).toBe(true);

      const content = fs.readFileSync(versionPath, 'utf-8');
      expect(content).toContain('m_EditorVersion');
    });

    it('creates Assets/Scenes directory', async () => {
      const projectPath = path.join(testDir, 'my-game');
      await createUnityProjectStructure(projectPath);

      expect(fs.existsSync(path.join(projectPath, 'Assets', 'Scenes'))).toBe(true);
    });

    it('creates Assets/Scripts directory', async () => {
      const projectPath = path.join(testDir, 'my-game');
      await createUnityProjectStructure(projectPath);

      expect(fs.existsSync(path.join(projectPath, 'Assets', 'Scripts'))).toBe(true);
    });

    it('adds VR packages when vr option is true', async () => {
      const projectPath = path.join(testDir, 'my-game');
      await createUnityProjectStructure(projectPath, { vr: true });

      const manifestPath = path.join(projectPath, 'Packages', 'manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

      expect(manifest.dependencies['com.unity.xr.interaction.toolkit']).toBeDefined();
      expect(manifest.dependencies['com.unity.inputsystem']).toBeDefined();
    });
  });

  describe('getProjectVersion', () => {
    it('extracts Unity version from ProjectVersion.txt', () => {
      fs.mkdirSync(path.join(testDir, 'ProjectSettings'), { recursive: true });
      fs.writeFileSync(
        path.join(testDir, 'ProjectSettings', 'ProjectVersion.txt'),
        'm_EditorVersion: 2022.3.0f1\nm_EditorVersionWithRevision: 2022.3.0f1 (abc123)'
      );

      expect(getProjectVersion(testDir)).toBe('2022.3.0f1');
    });

    it('returns null if ProjectVersion.txt does not exist', () => {
      expect(getProjectVersion(testDir)).toBeNull();
    });
  });
});
