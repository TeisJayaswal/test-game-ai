import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import { copyTemplate } from '../utils/template.js';

export interface CreateAnswers {
  projectName: string;
  gameType: 'third-person'; // More templates coming: 'first-person' | 'vr' | 'top-down'
  hasNormcoreAccount: boolean;
  appKey: string;
}

/**
 * Validates a project name.
 * @returns true if valid, or an error message string if invalid
 */
export function validateProjectName(input: string, cwd: string = process.cwd()): string | true {
  if (!/^[a-zA-Z0-9-_]+$/.test(input) || input.length === 0) {
    return 'Project name can only contain letters, numbers, dashes, and underscores';
  }
  if (fs.existsSync(path.join(cwd, input))) {
    return `Directory "${input}" already exists`;
  }
  return true;
}

/**
 * Validates a Normcore app key (UUID format).
 * Example: e087dd13-2c50-47ef-9ce7-0fc4a82d2bdc
 * @returns true if valid, or an error message string if invalid
 */
export function validateAppKey(input: string): string | true {
  const trimmed = input.trim();
  // UUID format: 8-4-4-4-12 hexadecimal characters
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(trimmed)) {
    return 'App Key should be a UUID (like e087dd13-2c50-47ef-9ce7-0fc4a82d2bdc). Check your Normcore dashboard.';
  }
  return true;
}

export async function createProject(name?: string): Promise<void> {
  console.log(chalk.blue('\n🎮 Welcome to game-ai! Let\'s create your multiplayer game.\n'));

  const answers = await inquirer.prompt<CreateAnswers>([
    {
      type: 'input',
      name: 'projectName',
      message: 'What do you want to call your game?',
      default: name || 'my-game',
      validate: (input) => validateProjectName(input),
    },
    {
      type: 'list',
      name: 'gameType',
      message: 'What kind of game do you want to make?',
      choices: [
        { name: '🏃 Third-person (like Fortnite, Fall Guys)', value: 'third-person' },
        // More templates coming soon:
        // { name: '🔫 First-person (like Minecraft, Portal)', value: 'first-person' },
        // { name: '🥽 VR game (Meta Quest, SteamVR)', value: 'vr' },
        // { name: '🎲 Top-down (like Among Us, Overcooked)', value: 'top-down' },
      ],
    },
    {
      type: 'confirm',
      name: 'hasNormcoreAccount',
      message: 'Do you have a Normcore account with an App Key?',
      default: false,
    },
    {
      type: 'input',
      name: 'appKey',
      message: (answers) => {
        if (!answers.hasNormcoreAccount) {
          console.log(chalk.yellow('\n📝 Let\'s get you set up with Normcore (it\'s free):\n'));
          console.log(chalk.gray('   1. Go to: https://dashboard.normcore.io'));
          console.log(chalk.gray('   2. Sign up for a free account'));
          console.log(chalk.gray('   3. Click "Create App" and give it any name'));
          console.log(chalk.gray('   4. Copy the App Key (a UUID like e087dd13-2c50-47ef-9ce7-0fc4a82d2bdc)\n'));
        }
        return 'Paste your Normcore App Key:';
      },
      validate: (input) => validateAppKey(input),
    },
  ]);

  const spinner = ora('Creating your game...').start();

  try {
    // Create project from template
    spinner.text = 'Setting up project structure...';
    copyTemplate(answers.gameType, answers.projectName, {
      appKey: answers.appKey,
      projectName: answers.projectName,
    });

    // Copy base files (.claude, .gitignore, README)
    spinner.text = 'Adding Claude Code helpers...';
    copyTemplate('base', answers.projectName, {
      appKey: answers.appKey,
      projectName: answers.projectName,
    });

    spinner.succeed(chalk.green('Your game is ready!'));

    // Success message with next steps
    const projectPath = path.resolve(answers.projectName);
    console.log(chalk.blue('\n🎉 Project created successfully!\n'));
    console.log(chalk.white('Next steps:'));
    console.log(chalk.gray('   1. Open Unity Hub'));
    console.log(chalk.gray(`   2. Click "Add" and select: ${projectPath}`));
    console.log(chalk.gray('   3. Open the project and wait for packages to import'));
    console.log(chalk.gray('   4. Open the "Game" scene in Assets/_Game/Scenes/'));
    console.log(chalk.gray('   5. Press Play - your game should work!'));
    console.log(chalk.yellow('\n💡 Tip: Open the project folder in Claude Code to start building!\n'));

  } catch (error) {
    spinner.fail('Failed to create project');
    throw error;
  }
}
