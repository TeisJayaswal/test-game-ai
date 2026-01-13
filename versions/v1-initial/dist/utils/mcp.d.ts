export interface MCPServerConfig {
    command: string;
    args?: string[];
    env?: Record<string, string>;
}
export interface ClaudeConfig {
    mcpServers: Record<string, MCPServerConfig>;
    [key: string]: unknown;
}
/**
 * Get the path to Claude's desktop configuration file based on the OS
 */
export declare function getClaudeConfigPath(): string;
/**
 * Read Claude's configuration file
 * Returns a default config with empty mcpServers if file doesn't exist
 */
export declare function readClaudeConfig(configPath: string): ClaudeConfig;
/**
 * Write Claude's configuration file
 * Creates parent directories if they don't exist
 */
export declare function writeClaudeConfig(configPath: string, config: ClaudeConfig): void;
/**
 * Add an MCP server to the configuration
 * Returns a new config object (immutable)
 */
export declare function addMCPServer(config: ClaudeConfig, name: string, serverConfig: MCPServerConfig): ClaudeConfig;
/**
 * Check if an MCP server is already configured
 */
export declare function hasMCPServer(config: ClaudeConfig, name: string): boolean;
//# sourceMappingURL=mcp.d.ts.map