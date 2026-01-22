import chalk from 'chalk';
import { waitForMcpRelay, mcpRelayExists } from '../utils/mcp.js';

/**
 * Wait for MCP relay to be installed
 * Useful after initializing a project or restarting Unity
 */
export async function waitForMcp(): Promise<void> {
  console.log(chalk.blue('\nChecking MCP status...\n'));

  // Check if already ready
  if (mcpRelayExists()) {
    console.log(chalk.green('✓ MCP relay is already installed and ready!\n'));
    console.log(chalk.gray('You can now run:'));
    console.log(chalk.cyan('  claude\n'));
    return;
  }

  console.log(chalk.gray('MCP relay not found yet. Waiting for Unity to install it...\n'));
  console.log(chalk.gray('Make sure Unity is open with your project.\n'));

  const ready = await waitForMcpRelay({ timeoutMs: 5 * 60 * 1000 });

  if (ready) {
    console.log(chalk.green('\n✓ MCP is ready!\n'));
    console.log(chalk.gray('You can now run:'));
    console.log(chalk.cyan('  claude\n'));
  } else {
    console.log(chalk.yellow('\nMCP relay not found after waiting.\n'));
    console.log(chalk.gray('Troubleshooting:'));
    console.log(chalk.gray('  1. Make sure Unity is open with your project'));
    console.log(chalk.gray('  2. Check the Unity console for errors'));
    console.log(chalk.gray('  3. Try: Window > Package Manager > Refresh\n'));
  }
}
