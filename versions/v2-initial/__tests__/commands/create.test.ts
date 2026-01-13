import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

// Test validation functions that will be exported from create.ts
import { validateProjectName, validateAppKey } from '../../commands/create.js';

describe('Create Command', () => {
  describe('validateProjectName', () => {
    it('accepts valid project names', () => {
      expect(validateProjectName('my-game')).toBe(true);
      expect(validateProjectName('MyGame')).toBe(true);
      expect(validateProjectName('game_01')).toBe(true);
      expect(validateProjectName('test123')).toBe(true);
    });

    it('rejects names with invalid characters', () => {
      expect(validateProjectName('my game')).toContain('can only contain');
      expect(validateProjectName('my.game')).toContain('can only contain');
      expect(validateProjectName('my/game')).toContain('can only contain');
      expect(validateProjectName('')).toContain('can only contain');
    });

    it('rejects names of existing directories', () => {
      // Use a directory that definitely exists
      const result = validateProjectName('node_modules', process.cwd());
      expect(result).toContain('already exists');
    });
  });

  describe('validateAppKey', () => {
    it('accepts valid UUID app keys', () => {
      expect(validateAppKey('e087dd13-2c50-47ef-9ce7-0fc4a82d2bdc')).toBe(true);
      expect(validateAppKey('00000000-0000-0000-0000-000000000000')).toBe(true);
      expect(validateAppKey('AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE')).toBe(true);
      // With leading/trailing whitespace
      expect(validateAppKey('  e087dd13-2c50-47ef-9ce7-0fc4a82d2bdc  ')).toBe(true);
    });

    it('rejects invalid app keys', () => {
      expect(validateAppKey('abc123')).toContain('UUID');
      expect(validateAppKey('nk_abc123')).toContain('UUID');
      expect(validateAppKey('')).toContain('UUID');
      expect(validateAppKey('not-a-valid-uuid-at-all')).toContain('UUID');
      // Wrong format (missing section)
      expect(validateAppKey('e087dd13-2c50-47ef-9ce7')).toContain('UUID');
    });
  });
});
