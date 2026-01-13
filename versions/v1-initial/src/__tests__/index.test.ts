import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';

describe('game-ai CLI', () => {
  const cliPath = path.join(__dirname, '../../dist/index.js');

  beforeEach(() => {
    // Ensure build is up to date
    execSync('npm run build', { cwd: path.join(__dirname, '../..'), stdio: 'pipe' });
  });

  describe('--help', () => {
    it('shows CLI name and description', () => {
      const output = execSync(`node ${cliPath} --help`).toString();
      expect(output).toContain('game-ai');
      expect(output).toContain('AI-powered Unity game development toolkit');
    });

    it('lists all available commands', () => {
      const output = execSync(`node ${cliPath} --help`).toString();
      expect(output).toContain('init');
      expect(output).toContain('install-mcp');
      expect(output).toContain('install-helpers');
      expect(output).toContain('update');
    });
  });

  describe('--version', () => {
    it('shows version number', () => {
      const output = execSync(`node ${cliPath} --version`).toString();
      expect(output.trim()).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('init command', () => {
    it('shows init command help with options', () => {
      const output = execSync(`node ${cliPath} init --help`).toString();
      expect(output).toContain('project-name');
      expect(output).toContain('--vr');
      expect(output).toContain('--multiplayer');
    });
  });
});
