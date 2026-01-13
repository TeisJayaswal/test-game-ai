import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
/**
 * Get the path to Claude's desktop configuration file based on the OS
 */
export function getClaudeConfigPath() {
    const platform = os.platform();
    switch (platform) {
        case 'darwin':
            return path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
        case 'win32':
            return path.join(process.env.APPDATA ?? '', 'Claude', 'claude_desktop_config.json');
        case 'linux':
        default:
            return path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json');
    }
}
/**
 * Read Claude's configuration file
 * Returns a default config with empty mcpServers if file doesn't exist
 */
export function readClaudeConfig(configPath) {
    if (!fs.existsSync(configPath)) {
        return { mcpServers: {} };
    }
    const content = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(content);
    // Ensure mcpServers exists
    if (!config.mcpServers) {
        config.mcpServers = {};
    }
    return config;
}
/**
 * Write Claude's configuration file
 * Creates parent directories if they don't exist
 */
export function writeClaudeConfig(configPath, config) {
    const dir = path.dirname(configPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}
/**
 * Add an MCP server to the configuration
 * Returns a new config object (immutable)
 */
export function addMCPServer(config, name, serverConfig) {
    return {
        ...config,
        mcpServers: {
            ...config.mcpServers,
            [name]: serverConfig,
        },
    };
}
/**
 * Check if an MCP server is already configured
 */
export function hasMCPServer(config, name) {
    return name in config.mcpServers;
}
//# sourceMappingURL=mcp.js.map