import chalk from 'chalk';
import { generateMcpConfig, hasMcpConfig, mcpRelayExists } from '../utils/mcp.js';

/**
 * Configure MCP for Claude Code
 * Generates .mcp.json with the correct path for the current OS
 */
export async function configureMcp(): Promise<void> {
  const projectPath = process.cwd();

  console.log(chalk.blue('\nConfiguring MCP for Claude Code...\n'));

  // Check if .mcp.json already exists
  if (hasMcpConfig(projectPath)) {
    console.log(chalk.yellow('Note: .mcp.json already exists and will be overwritten.\n'));
  }

  // Generate the config
  try {
    generateMcpConfig(projectPath);
    console.log(chalk.green('✓ Created .mcp.json\n'));
  } catch (error) {
    if (error instanceof Error) {
      console.log(chalk.red(`✗ Failed to create .mcp.json: ${error.message}`));
    }
    process.exit(1);
  }

  // Check if the relay script exists
  if (mcpRelayExists()) {
    console.log(chalk.green('✓ Unity MCP relay found\n'));
  } else {
    console.log(chalk.yellow('! Unity MCP relay not found yet'));
    console.log(chalk.gray('  This is normal if Unity hasn\'t been opened yet.'));
    console.log(chalk.gray('  The relay gets installed when Unity opens and resolves packages.\n'));
  }

  console.log(chalk.blue('Next steps:'));
  console.log(chalk.gray('  1. Open the project in Unity (packages will install)'));
  console.log(chalk.gray('  2. Wait for Unity to finish resolving packages'));
  console.log(chalk.gray('  3. Run "claude" in this directory to start coding!\n'));
}
