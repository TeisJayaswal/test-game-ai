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

    it('should contain Claude commands structure', () => {
      const templatePath = getTemplatePath();
      expect(fs.existsSync(path.join(templatePath, '.claude'))).toBe(true);
      expect(fs.existsSync(path.join(templatePath, '.claude', 'CLAUDE.md'))).toBe(true);
    });

    it('should contain Packages with manifest.json', () => {
      const templatePath = getTemplatePath();
      expect(fs.existsSync(path.join(templatePath, 'Packages'))).toBe(true);
      expect(fs.existsSync(path.join(templatePath, 'Packages', 'manifest.json'))).toBe(true);
    });

    it('should contain Assets folder', () => {
      const templatePath = getTemplatePath();
      expect(fs.existsSync(path.join(templatePath, 'Assets'))).toBe(true);
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
      expect(fs.existsSync(path.join(destPath, '.claude'))).toBe(true);
      expect(fs.existsSync(path.join(destPath, 'Assets'))).toBe(true);
      expect(fs.existsSync(path.join(destPath, 'Packages'))).toBe(true);
    });

    it('should copy CLAUDE.md', () => {
      const destPath = path.join(testDir, 'my-game');
      copyTemplate(destPath);

      const claudeMdPath = path.join(destPath, '.claude', 'CLAUDE.md');
      expect(fs.existsSync(claudeMdPath)).toBe(true);
    });

    it('should copy manifest.json with Unity MCP package', () => {
      const destPath = path.join(testDir, 'my-game');
      copyTemplate(destPath);

      const manifestPath = path.join(destPath, 'Packages', 'manifest.json');
      expect(fs.existsSync(manifestPath)).toBe(true);

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      // Use 'in' operator for broader compatibility with test runners
      expect('com.codemaestroai.advancedunitymcp' in manifest.dependencies).toBe(true);
    });

    it('should copy commands folder', () => {
      const destPath = path.join(testDir, 'my-game');
      copyTemplate(destPath);

      const commandsPath = path.join(destPath, '.claude', 'commands');
      expect(fs.existsSync(commandsPath)).toBe(true);
    });

    it('should copy skills folder', () => {
      const destPath = path.join(testDir, 'my-game');
      copyTemplate(destPath);

      const skillsPath = path.join(destPath, '.claude', 'skills');
      expect(fs.existsSync(skillsPath)).toBe(true);
    });
  });
});
