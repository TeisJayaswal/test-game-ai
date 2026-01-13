import chalk from 'chalk';
import * as fs from 'fs';

export async function installMCP(): Promise<void> {
  // Check we're in a Unity project
  if (!fs.existsSync('Assets') || !fs.existsSync('Packages')) {
    console.log(chalk.red('\nNot in a Unity project directory'));
    console.log(chalk.gray('Run this command from inside your Unity project folder.\n'));
    process.exit(1);
  }

  console.log(chalk.blue('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.blue.bold('  Unity MCP Setup Instructions'));
  console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

  console.log(chalk.yellow('Step 1: Install the Unity Package'));
  console.log(chalk.gray('  1. Open your project in Unity'));
  
  console.log(chalk.gray('  2. Go to Window > Package Manager'));
  console.log(chalk.gray('  3. Click + > Add package from git URL'));
  console.log(chalk.gray('  4. Paste this URL:\n'));
  console.log(chalk.cyan('     https://github.com/codemaestroai/advanced-unity-mcp.git?path=Unity6\n'));

  console.log(chalk.yellow('Step 2: Connect to Claude Code'));
  console.log(chalk.gray('  1. In Unity, go to Code Maestro > MCP Dashboard'));
  console.log(chalk.gray('  2. Select "Other Clients" connection mode'));
  console.log(chalk.gray('  3. Click Configure next to your AI client'));
  console.log(chalk.gray('  4. Follow the automatic setup\n'));

  console.log(chalk.yellow('Step 3: Restart Claude Code'));
  console.log(chalk.gray('  After setup, restart Claude Code to connect.\n'));

  console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.green('  Once connected, Claude can control Unity directly!'));
  console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
}
