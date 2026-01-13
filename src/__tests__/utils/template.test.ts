import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { getTemplatePath, copyTemplate } from '../../utils/template.js';

describe('template utils', () => {
  describe('getTemplatePath', () => {
    it('should return the template path', () => {
      const templatePath = getTemplatePath();
      expect(templatePath).toContain('template');
      expect(fs.existsSync(templatePath)).toBe(true);
    });

    it('should contain Unity project structure', () => {
      const templatePath = getTemplatePath();
      expect(fs.existsSync(path.join(templatePath, 'Assets'))).toBe(true);
      expect(fs.existsSync(path.join(templatePath, 'Packages'))).toBe(true);
      expect(fs.existsSync(path.join(templatePath, 'ProjectSettings'))).toBe(true);
    });
  });

  describe('copyTemplate', () => {
    let testDir: string;

    beforeEach(() => {
      testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'game-ai-test-'));
    });

    afterEach(() => {
      fs.rmSync(testDir, { recursive: true, force: true });
    });

    it('should copy template to destination', () => {
      const destPath = path.join(testDir, 'my-game');
      copyTemplate(destPath);

      expect(fs.existsSync(destPath)).toBe(true);
      expect(fs.existsSync(path.join(destPath, 'Assets'))).toBe(true);
      expect(fs.existsSync(path.join(destPath, 'Packages'))).toBe(true);
      expect(fs.existsSync(path.join(destPath, 'ProjectSettings'))).toBe(true);
    });

    it('should copy NormcoreAppSettings.asset', () => {
      const destPath = path.join(testDir, 'my-game');
      copyTemplate(destPath);

      const settingsPath = path.join(destPath, 'Assets', 'Normal', 'Resources', 'NormcoreAppSettings.asset');
      expect(fs.existsSync(settingsPath)).toBe(true);
    });
  });
});
