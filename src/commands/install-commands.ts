import chalk from 'chalk';
import ora from 'ora';
import { copyCommands, hasClaudeCommands } from '../utils/commands.js';

/**
 * Install Claude commands (.claude folder) to the current directory
 */
export async function installCommands(): Promise<void> {
  const projectPath = process.cwd();

  console.log(chalk.blue('\nInstalling Claude commands...\n'));

  // Check if commands already exist
  if (hasClaudeCommands(projectPath)) {
    console.log(chalk.yellow('Note: .claude folder already exists and will be overwritten.\n'));
  }

  const spinner = ora('Copying commands, skills, and agents...').start();

  try {
    copyCommands(projectPath);
    spinner.succeed(chalk.green('Claude commands installed!'));
  } catch (error) {
    spinner.fail('Failed to install commands');
    if (error instanceof Error) {
      console.log(chalk.red(`Error: ${error.message}`));
    }
    process.exit(1);
  }

  console.log(chalk.blue('\nInstalled:'));
  console.log(chalk.gray('  • CLAUDE.md - Claude\'s instructions for game development'));
  console.log(chalk.gray('  • commands/ - Custom slash commands (e.g., /playtest, /build)'));
  console.log(chalk.gray('  • skills/ - Game development skills (e.g., adding-enemies, adding-ui)'));
  console.log(chalk.gray('  • agents/ - Specialized agents (e.g., asset-finder, code-debugger)'));

  console.log(chalk.blue('\nUsage:'));
  console.log(chalk.gray('  Run "claude" in this directory to start coding with AI!\n'));
}
