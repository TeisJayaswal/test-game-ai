import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import {
  findUnityInstalls,
  createUnityProject,
  getMcpPackageUrl,
  openUnityProject,
  UnityInstall
} from '../utils/unity.js';
import { copyTemplate } from '../utils/template.js';
import { generateMcpConfig } from '../utils/mcp.js';

/**
 * Validate project name to prevent path traversal
 */
function isValidProjectName(name: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(name);
}

/**
 * Create a new Unity project with Claude and MCP pre-configured
 */
export async function createUnity(name?: string): Promise<void> {
  console.log(chalk.blue('\n🎮 Create Unity Project\n'));

  // Get project name
  let projectName: string;
  if (name) {
    projectName = name;
  } else {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Project name:',
        validate: (input: string) => {
          if (!input.trim()) return 'Project name is required';
          if (!isValidProjectName(input.trim())) {
            return 'Project name must contain only letters, numbers, hyphens, and underscores';
          }
          return true;
        }
      }
    ]);
    projectName = answer.name.trim();
  }

  // Validate project name
  if (!isValidProjectName(projectName)) {
    console.log(chalk.red('Project name must contain only letters, numbers, hyphens, and underscores'));
    process.exit(1);
  }

  // Check if directory exists
  const projectPath = path.resolve(projectName);
  if (fs.existsSync(projectPath)) {
    console.log(chalk.red(`Directory "${projectName}" already exists`));
    process.exit(1);
  }

  // Find Unity installations
  console.log(chalk.gray('Finding Unity installations...\n'));
  const installs = findUnityInstalls();

  if (installs.length === 0) {
    console.log(chalk.red('No Unity installations found.'));
    console.log(chalk.gray('\nUnity Hub installs Unity to:'));
    console.log(chalk.gray('  Mac: /Applications/Unity/Hub/Editor/'));
    console.log(chalk.gray('  Windows: C:\\Program Files\\Unity\\Hub\\Editor\\'));
    console.log(chalk.gray('\nPlease install Unity via Unity Hub and try again.\n'));
    process.exit(1);
  }

  // Let user select Unity version
  const { selectedVersion } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedVersion',
      message: 'Select Unity version:',
      choices: installs.map((install: UnityInstall) => ({
        name: `${install.version}${install.isUnity6 ? ' (Unity 6 - recommended)' : ''}`,
        value: install.version
      }))
    }
  ]);

  const selectedInstall = installs.find((i: UnityInstall) => i.version === selectedVersion)!;

  console.log(chalk.blue(`\nCreating "${projectName}" with Unity ${selectedVersion}...\n`));

  // Create Unity project
  const spinner = ora('Creating Unity project (this may take a minute)...').start();

  try {
    await createUnityProject(selectedInstall.path, projectPath);
    spinner.succeed('Unity project created');
  } catch (error) {
    spinner.fail('Failed to create Unity project');
    if (error instanceof Error) {
      console.log(chalk.red(`Error: ${error.message}`));
    }
    process.exit(1);
  }

  // Copy template files (overwrites manifest.json with our configured one)
  spinner.start('Installing Claude commands and MCP...');
  try {
    copyTemplate(projectPath);

    // Update manifest.json with correct MCP package URL for Unity version
    const manifestPath = path.join(projectPath, 'Packages', 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const mcpUrl = getMcpPackageUrl(selectedVersion);
      manifest.dependencies['com.codemaestroai.advancedunitymcp'] = mcpUrl;
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    }

    spinner.succeed('Claude commands and MCP installed');
  } catch (error) {
    spinner.fail('Failed to install Claude commands');
    if (error instanceof Error) {
      console.log(chalk.red(`Error: ${error.message}`));
    }
    process.exit(1);
  }

  // Generate .mcp.json
  spinner.start('Configuring MCP...');
  try {
    generateMcpConfig(projectPath);
    spinner.succeed('MCP configured');
  } catch (error) {
    spinner.fail('Failed to configure MCP');
    if (error instanceof Error) {
      console.log(chalk.red(`Error: ${error.message}`));
    }
    process.exit(1);
  }

  // Open Unity
  spinner.start('Opening Unity...');
  try {
    openUnityProject(selectedInstall.path, projectPath);
    spinner.succeed('Unity is opening');
  } catch (error) {
    spinner.warn('Could not open Unity automatically');
  }

  // Success!
  console.log(chalk.green(`\n✓ Project "${projectName}" created!\n`));

  console.log(chalk.blue('Next steps:'));
  console.log(chalk.gray(`  1. cd ${projectName}`));
  console.log(chalk.gray('  2. Wait for Unity to finish loading (packages install automatically)'));
  console.log(chalk.gray('  3. Run "claude" to start building your game!\n'));
}
