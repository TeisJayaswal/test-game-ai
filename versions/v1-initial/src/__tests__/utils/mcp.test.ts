import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  getClaudeConfigPath,
  readClaudeConfig,
  writeClaudeConfig,
  addMCPServer,
} from '../../utils/mcp.js';

describe('MCP utilities', () => {
  const testDir = '/tmp/game-ai-mcp-test';
  const mockConfigDir = path.join(testDir, 'claude-config');

  beforeEach(() => {
    fs.mkdirSync(mockConfigDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  describe('getClaudeConfigPath', () => {
    it('returns a valid path that ends with claude_desktop_config.json', () => {
      const configPath = getClaudeConfigPath();
      expect(configPath).toMatch(/claude_desktop_config\.json$/);
    });

    it('includes Claude in the path', () => {
      const configPath = getClaudeConfigPath();
      expect(configPath).toContain('Claude');
    });
  });

  describe('readClaudeConfig', () => {
    it('returns empty object with mcpServers if config file does not exist', () => {
      const config = readClaudeConfig('/nonexistent/path.json');
      expect(config).toEqual({ mcpServers: {} });
    });

    it('reads existing config file', () => {
      const configPath = path.join(mockConfigDir, 'config.json');
      const existingConfig = {
        mcpServers: {
          existing: { command: 'test' },
        },
      };
      fs.writeFileSync(configPath, JSON.stringify(existingConfig));

      const config = readClaudeConfig(configPath);
      expect(config).toEqual(existingConfig);
    });

    it('adds mcpServers key if missing from existing config', () => {
      const configPath = path.join(mockConfigDir, 'config.json');
      fs.writeFileSync(configPath, JSON.stringify({ someOtherKey: 'value' }));

      const config = readClaudeConfig(configPath);
      expect(config).toEqual({ someOtherKey: 'value', mcpServers: {} });
    });
  });

  describe('writeClaudeConfig', () => {
    it('creates parent directories if they do not exist', () => {
      const configPath = path.join(mockConfigDir, 'nested', 'dir', 'config.json');
      const config = { mcpServers: {} };

      writeClaudeConfig(configPath, config);

      expect(fs.existsSync(configPath)).toBe(true);
    });

    it('writes config as formatted JSON', () => {
      const configPath = path.join(mockConfigDir, 'config.json');
      const config = { mcpServers: { test: { command: 'node' } } };

      writeClaudeConfig(configPath, config);

      const written = fs.readFileSync(configPath, 'utf-8');
      expect(written).toBe(JSON.stringify(config, null, 2));
    });
  });

  describe('addMCPServer', () => {
    it('adds a new MCP server to config', () => {
      const config = { mcpServers: {} };

      const updated = addMCPServer(config, 'unity', {
        command: 'node',
        args: ['/path/to/server.js'],
        env: { UNITY_PROJECT_PATH: '/path/to/project' },
      });

      expect(updated.mcpServers.unity).toEqual({
        command: 'node',
        args: ['/path/to/server.js'],
        env: { UNITY_PROJECT_PATH: '/path/to/project' },
      });
    });

    it('preserves existing MCP servers', () => {
      const config = {
        mcpServers: {
          existing: { command: 'test' },
        },
      };

      const updated = addMCPServer(config, 'unity', {
        command: 'node',
        args: [],
      });

      expect(updated.mcpServers.existing).toEqual({ command: 'test' });
      expect(updated.mcpServers.unity).toBeDefined();
    });

    it('overwrites server with same name', () => {
      const config = {
        mcpServers: {
          unity: { command: 'old' },
        },
      };

      const updated = addMCPServer(config, 'unity', {
        command: 'new',
        args: [],
      });

      expect(updated.mcpServers.unity.command).toBe('new');
    });

    it('does not mutate original config', () => {
      const config = { mcpServers: {} };

      addMCPServer(config, 'unity', { command: 'node' });

      expect(config.mcpServers.unity).toBeUndefined();
    });
  });
});
