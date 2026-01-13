import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';
import { copyTemplate, listTemplates } from '../../utils/template.js';

describe('Template Utilities', () => {
  let testDir: string;

  beforeEach(() => {
    // Create a unique temp directory for each test
    testDir = fs.mkdtempSync(path.join(tmpdir(), 'game-ai-test-'));
  });

  afterEach(() => {
    // Clean up temp directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('copyTemplate', () => {
    it('throws error for non-existent template', () => {
      // Use a path within cwd
      const destPath = path.join(process.cwd(), 'test-project-temp');
      try {
        expect(() => copyTemplate('nonexistent', destPath, {
          appKey: 'nk_test123',
          projectName: 'test-project',
        })).toThrow('Template directory not found: nonexistent');
      } finally {
        // Clean up if somehow created
        if (fs.existsSync(destPath)) {
          fs.rmSync(destPath, { recursive: true, force: true });
        }
      }
    });

    it('throws error for invalid template names with path traversal', () => {
      const destPath = path.join(process.cwd(), 'test-project-temp');

      expect(() => copyTemplate('../etc', destPath, {
        appKey: 'nk_test123',
        projectName: 'test-project',
      })).toThrow('Invalid template name');

      expect(() => copyTemplate('foo/../bar', destPath, {
        appKey: 'nk_test123',
        projectName: 'test-project',
      })).toThrow('Invalid template name');

      expect(() => copyTemplate('foo/bar', destPath, {
        appKey: 'nk_test123',
        projectName: 'test-project',
      })).toThrow('Invalid template name');
    });

    it('throws error for template names with special characters', () => {
      const destPath = path.join(process.cwd(), 'test-project-temp');

      expect(() => copyTemplate('my template', destPath, {
        appKey: 'nk_test123',
        projectName: 'test-project',
      })).toThrow('Invalid template name');

      expect(() => copyTemplate('template.name', destPath, {
        appKey: 'nk_test123',
        projectName: 'test-project',
      })).toThrow('Invalid template name');
    });

    it('throws error for absolute path destinations outside cwd', () => {
      // Try to write to /tmp which is outside cwd
      expect(() => copyTemplate('base', '/tmp/malicious-path', {
        appKey: 'nk_test123',
        projectName: 'test-project',
      })).toThrow('Destination must be within current directory');
    });
  });

  describe('listTemplates', () => {
    it('returns an array', () => {
      const templates = listTemplates();
      expect(Array.isArray(templates)).toBe(true);
    });
  });
});
