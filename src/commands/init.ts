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
import { isWindows } from '../utils/platform.js';

/**
 * Validate project name to prevent path traversal
 */
function isValidProjectName(name: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(name);
}

/**
 * Main interactive wizard for setting up a new game project
 */
export async function init(): Promise<void> {
  console.log(chalk.blue(`
╔════════════════════════════════════════╗
║       🎮 game-ai - Create Game         ║
║   AI-powered Unity game development    ║
╚════════════════════════════════════════╝
`));

  // Step 1: Find Unity installations
  console.log(chalk.gray('Finding Unity installations...\n'));
  const installs = findUnityInstalls();

  if (installs.length === 0) {
    console.log(chalk.red('❌ No Unity installations found.\n'));
    console.log(chalk.gray('Unity Hub installs Unity to:'));
    console.log(chalk.gray('  Mac: /Applications/Unity/Hub/Editor/'));
    console.log(chalk.gray('  Windows: C:\\Program Files\\Unity\\Hub\\Editor\\\n'));
    console.log(chalk.gray('Please install Unity via Unity Hub and try again.\n'));
    process.exit(1);
  }

  console.log(chalk.green(`✓ Found ${installs.length} Unity installation${installs.length > 1 ? 's' : ''}\n`));

  // Step 2: Get project details
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'What\'s your game called?',
      validate: (input: string) => {
        const trimmed = input.trim();
        if (!trimmed) return 'Project name is required';
        if (!isValidProjectName(trimmed)) {
          return 'Use only letters, numbers, hyphens, and underscores';
        }
        if (fs.existsSync(path.resolve(trimmed))) {
          return `Folder "${trimmed}" already exists`;
        }
        return true;
      }
    },
    {
      type: 'list',
      name: 'unityVersion',
      message: 'Select Unity version:',
      choices: installs.map((install: UnityInstall) => ({
        name: `${install.version}${install.isUnity6 ? chalk.green(' (Unity 6 - recommended)') : ''}`,
        value: install.version
      }))
    }
  ]);

  const projectName = answers.projectName.trim();
  const projectPath = path.resolve(projectName);
  const selectedInstall = installs.find((i: UnityInstall) => i.version === answers.unityVersion)!;

  console.log(chalk.blue(`\n📁 Creating "${projectName}"...\n`));

  // Step 3: Create Unity project
  const spinner = ora('Creating Unity project (this may take a minute)...').start();

  try {
    await createUnityProject(selectedInstall.path, projectPath);
    spinner.succeed('Unity project created');
  } catch (error) {
    spinner.fail('Failed to create Unity project');
    if (error instanceof Error) {
      console.log(chalk.red(`\nError: ${error.message}`));
      console.log(chalk.gray('\nMake sure Unity is installed correctly and try again.\n'));
    }
    process.exit(1);
  }

  // Step 4: Copy template files
  spinner.start('Installing Claude commands, skills, and agents...');
  try {
    copyTemplate(projectPath);

    // Update manifest.json with correct MCP package URL for Unity version
    const manifestPath = path.join(projectPath, 'Packages', 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const mcpUrl = getMcpPackageUrl(answers.unityVersion);
      manifest.dependencies['com.codemaestroai.advancedunitymcp'] = mcpUrl;
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    }

    spinner.succeed('Claude commands installed');
  } catch (error) {
    spinner.fail('Failed to install Claude commands');
    if (error instanceof Error) {
      console.log(chalk.red(`Error: ${error.message}`));
    }
    process.exit(1);
  }

  // Step 5: Generate .mcp.json
  spinner.start('Configuring MCP for Claude Code...');
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

  // Step 6: Open Unity
  spinner.start('Opening Unity...');
  try {
    openUnityProject(selectedInstall.path, projectPath);
    spinner.succeed('Unity is opening (packages will install automatically)');
  } catch (error) {
    spinner.warn('Could not open Unity automatically');
    console.log(chalk.gray('  Please open the project manually in Unity Hub.\n'));
  }

  // Success!
  console.log(chalk.green(`
╔════════════════════════════════════════╗
║         ✓ Project Created!             ║
╚════════════════════════════════════════╝
`));

  console.log(chalk.blue('Next steps:\n'));

  const cdCmd = `cd ${projectName}`;
  console.log(chalk.white(`  1. ${chalk.cyan(cdCmd)}`));
  console.log(chalk.gray('     Navigate to your project\n'));

  console.log(chalk.white(`  2. ${chalk.cyan('Wait for Unity to finish loading')}`));
  console.log(chalk.gray('     Packages will install automatically (~1-2 min)\n'));

  console.log(chalk.white(`  3. ${chalk.cyan('claude')}`));
  console.log(chalk.gray('     Start building with AI!\n'));

  console.log(chalk.gray('─'.repeat(44)));
  console.log(chalk.gray('\nTip: Use /new-game to start building!'));
  console.log(chalk.gray('Example: /new-game space shooter where you dodge asteroids\n'));
}
