import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { installMCP } from '../../commands/install-mcp.js';
import { readClaudeConfig } from '../../utils/mcp.js';

describe('install-mcp command', () => {
  const testDir = '/tmp/game-ai-install-mcp-test';
  const testProjectPath = path.join(testDir, 'test-unity-project');
  const testConfigPath = path.join(testDir, 'claude-config', 'claude_desktop_config.json');

  beforeEach(() => {
    // Create test directories
    fs.mkdirSync(testProjectPath, { recursive: true });
    fs.mkdirSync(path.dirname(testConfigPath), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  describe('installMCP', () => {
    it('provides instructions for Unity MCP installation', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      await installMCP({ projectPath: testProjectPath });

      const logCalls = consoleSpy.mock.calls.map(call => call.join(' ')).join('\n');
      expect(logCalls).toContain('MCP');
    });

    it('shows the git URL for the MCP package', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      await installMCP({ projectPath: testProjectPath });

      const logCalls = consoleSpy.mock.calls.map(call => call.join(' ')).join('\n');
      expect(logCalls).toContain('github.com/codemaestroai/advanced-unity-mcp');
    });

    it('mentions opening the MCP Dashboard in Unity', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      await installMCP({ projectPath: testProjectPath });

      const logCalls = consoleSpy.mock.calls.map(call => call.join(' ')).join('\n');
      expect(logCalls).toContain('MCP Dashboard');
    });
  });
});
