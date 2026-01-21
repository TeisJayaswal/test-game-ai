import * as fs from 'fs';
import * as path from 'path';
import { getPlatform, getHomeDir, getMcpRelayPath, isMac, isWindows } from './platform.js';

/**
 * The MCP server name used in configuration
 */
export const MCP_SERVER_NAME = 'advanced-unity-mcp';

/**
 * MCP configuration structure
 */
export interface McpConfig {
  mcpServers: {
    [key: string]: {
      command: string;
      args: string[];
    };
  };
}

/**
 * Get the MCP configuration object for the current platform
 *
 * Mac uses: { command: "bash", args: ["/path/to/launch.sh"] }
 * Windows uses: { command: "C:\\path\\to\\launch.bat", args: [] }
 *
 * @param platform - Override platform for testing
 * @param homeDir - Override home directory for testing (Mac)
 * @param localAppData - Override LOCALAPPDATA for testing (Windows)
 */
export function getMcpConfigObject(
  platform: NodeJS.Platform = getPlatform(),
  homeDir: string = getHomeDir(),
  localAppData: string = process.env.LOCALAPPDATA || ''
): McpConfig {
  const relayPath = getMcpRelayPath(platform, homeDir, localAppData);

  if (isMac(platform)) {
    return {
      mcpServers: {
        [MCP_SERVER_NAME]: {
          command: 'bash',
          args: [relayPath]
        }
      }
    };
  } else if (isWindows(platform)) {
    // Windows: command is the .bat path directly, args is empty
    return {
      mcpServers: {
        [MCP_SERVER_NAME]: {
          command: relayPath,
          args: []
        }
      }
    };
  }

  throw new Error('Unsupported platform');
}

/**
 * Generate and write the .mcp.json configuration file to a project directory
 *
 * @param projectPath - Path to the project directory
 * @param platform - Override platform for testing
 * @param homeDir - Override home directory for testing (Mac)
 * @param localAppData - Override LOCALAPPDATA for testing (Windows)
 */
export function generateMcpConfig(
  projectPath: string,
  platform: NodeJS.Platform = getPlatform(),
  homeDir: string = getHomeDir(),
  localAppData: string = process.env.LOCALAPPDATA || ''
): void {
  const config = getMcpConfigObject(platform, homeDir, localAppData);
  const configPath = path.join(projectPath, '.mcp.json');

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
}

/**
 * Check if a project has an .mcp.json file
 */
export function hasMcpConfig(projectPath: string): boolean {
  const configPath = path.join(projectPath, '.mcp.json');
  return fs.existsSync(configPath);
}

/**
 * Check if the MCP relay script exists on the system
 * (It gets installed when Unity MCP package is installed and Unity is opened)
 */
export function mcpRelayExists(
  platform: NodeJS.Platform = getPlatform(),
  homeDir: string = getHomeDir(),
  localAppData: string = process.env.LOCALAPPDATA || ''
): boolean {
  const relayPath = getMcpRelayPath(platform, homeDir, localAppData);
  return fs.existsSync(relayPath);
}
