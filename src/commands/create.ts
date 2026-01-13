import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import { copyTemplate } from '../utils/template.js';
import { injectAppKey } from '../utils/normcore.js';

/**
 * Validate project name to prevent path traversal
 */
function isValidProjectName(name: string): boolean {
  // Only allow alphanumeric, hyphens, underscores
  return /^[a-zA-Z0-9_-]+$/.test(name);
}

export async function createProject(name: string): Promise<void> {
  console.log(chalk.blue('\nWelcome to game-ai!\n'));

  // Validate project name
  if (!isValidProjectName(name)) {
    console.log(chalk.red('Project name must contain only letters, numbers, hyphens, and underscores'));
    process.exit(1);
  }

  // Check if directory exists
  if (fs.existsSync(name)) {
    console.log(chalk.red(`Directory "${name}" already exists`));
    process.exit(1);
  }

  // Get app key
  const { appKey } = await inquirer.prompt([
    {
      type: 'input',
      name: 'appKey',
      message: () => {
        console.log(chalk.yellow('Get your free Normcore App Key:'));
        console.log(chalk.gray('  1. Go to: https://normcore.io/dashboard'));
        console.log(chalk.gray('  2. Sign up (free)'));
        console.log(chalk.gray('  3. Create an app'));
        console.log(chalk.gray('  4. Copy the App Key\n'));
        return 'Paste your Normcore App Key:';
      },
      validate: (input: string) => {
        const trimmed = input.trim();
        if (trimmed.length < 20) return 'App Key appears too short';
        return true;
      }
    }
  ]);

  const spinner = ora('Creating your game...').start();

  try {
    const projectPath = path.resolve(name);

    // Copy template
    spinner.text = 'Copying Unity project...';
    copyTemplate(projectPath);

    // Inject app key
    spinner.text = 'Configuring Normcore...';
    injectAppKey(projectPath, appKey.trim());

    spinner.succeed(chalk.green('Unity project created!'));

    // Next steps
    console.log(chalk.blue('\nNext steps:'));
    console.log(chalk.gray(`  cd ${name}`));
    console.log(chalk.gray('  npx @normal/game-ai install-mcp'));
    console.log(chalk.gray('  npx @normal/game-ai install-helpers'));
    console.log(chalk.gray('\nThen open the project in Unity Hub.\n'));

  } catch (error) {
    spinner.fail('Failed to create project');
    if (error instanceof Error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
    throw error;
  }
}

// Export for testing
export { isValidProjectName };
