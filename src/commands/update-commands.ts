import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import {
  ensureTemplate,
  writeCommandsVersion,
  writeHashes,
  getCommandsVersion,
  areCommandsOutdated,
  compareWithTemplate,
  FileChange
} from '../utils/template.js';
import { getCurrentVersion } from '../utils/updater.js';

/**
 * Copy a single file from template to project
 */
function copyFile(templatePath: string, projectPath: string, file: string): void {
  const src = path.join(templatePath, '.claude', file);
  const dest = path.join(projectPath, '.claude', file);

  // Ensure directory exists
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

/**
 * Update Claude commands and skills to the latest version
 */
export async function updateCommands(): Promise<void> {
  const projectPath = process.cwd();
  const claudeDir = path.join(projectPath, '.claude');

  console.log(chalk.blue('\nChecking for command updates...\n'));

  // Check if .claude directory exists
  if (!fs.existsSync(claudeDir)) {
    console.log(chalk.yellow('No .claude directory found in current directory.'));
    console.log(chalk.gray('Run this command from a gamekit project, or use `gamekit init` first.\n'));
    return;
  }

  const installedVersion = getCommandsVersion(projectPath);
  const currentVersion = getCurrentVersion();

  if (installedVersion) {
    console.log(chalk.gray(`Installed commands version: ${installedVersion}`));
    console.log(chalk.gray(`Latest commands version: ${currentVersion}\n`));
  }

  if (!areCommandsOutdated(projectPath) && installedVersion) {
    console.log(chalk.green('✓ Commands are already up to date!\n'));
    return;
  }

  const spinner = ora('Checking for changes...').start();

  let templatePath: string;
  let changes: FileChange[];

  try {
    // Get the template path (downloads if needed)
    templatePath = await ensureTemplate();
    const templateClaudeDir = path.join(templatePath, '.claude');

    if (!fs.existsSync(templateClaudeDir)) {
      spinner.fail('Template .claude directory not found');
      return;
    }

    // Compare files
    changes = compareWithTemplate(projectPath, templatePath);
    spinner.stop();
  } catch (error) {
    spinner.fail('Failed to check for updates');
    if (error instanceof Error) {
      console.log(chalk.red(`Error: ${error.message}\n`));
    }
    return;
  }

  // Categorize changes
  const newFiles = changes.filter(c => c.status === 'new');
  const modifiedFiles = changes.filter(c => c.status === 'modified');
  const unchangedFiles = changes.filter(c => c.status === 'unchanged');

  // Files that need updating (template is different from what's installed)
  const filesToUpdate = unchangedFiles.filter(c => c.currentHash !== c.templateHash);

  if (newFiles.length === 0 && modifiedFiles.length === 0 && filesToUpdate.length === 0) {
    console.log(chalk.green('✓ All files are up to date!\n'));
    writeCommandsVersion(projectPath);
    return;
  }

  // Show summary
  console.log(chalk.blue('Update summary:\n'));

  if (newFiles.length > 0) {
    console.log(chalk.green(`  ${newFiles.length} new file${newFiles.length > 1 ? 's' : ''} to add`));
  }
  if (filesToUpdate.length > 0) {
    console.log(chalk.cyan(`  ${filesToUpdate.length} file${filesToUpdate.length > 1 ? 's' : ''} to update`));
  }
  if (modifiedFiles.length > 0) {
    console.log(chalk.yellow(`  ${modifiedFiles.length} file${modifiedFiles.length > 1 ? 's' : ''} you've modified`));
  }
  console.log('');

  // Track what we'll update
  const updates: string[] = [];
  const preserved: string[] = [];

  // Handle new files - always add
  for (const change of newFiles) {
    copyFile(templatePath, projectPath, change.file);
    updates.push(change.file);
  }

  // Handle unchanged files that need updating - always update
  for (const change of filesToUpdate) {
    copyFile(templatePath, projectPath, change.file);
    updates.push(change.file);
  }

  // Handle modified files - ask user
  for (const change of modifiedFiles) {
    console.log(chalk.yellow(`\nYou've modified: ${change.file}`));

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Keep my version', value: 'keep' },
          { name: 'Replace with latest', value: 'replace' }
        ],
        default: 'keep'
      }
    ]);

    if (action === 'replace') {
      copyFile(templatePath, projectPath, change.file);
      updates.push(change.file);
    } else {
      preserved.push(change.file);
    }
  }

  // Write new hashes and version
  writeHashes(projectPath);
  writeCommandsVersion(projectPath);

  // Show results
  console.log('');

  if (updates.length > 0) {
    console.log(chalk.green('Updated:'));
    for (const file of updates) {
      console.log(chalk.green(`  ✓ ${file}`));
    }
  }

  if (preserved.length > 0) {
    console.log(chalk.yellow('\nPreserved (your changes kept):'));
    for (const file of preserved) {
      console.log(chalk.yellow(`  ⊘ ${file}`));
    }
  }

  console.log(chalk.green(`\n✓ Updated to v${currentVersion}`));
  if (preserved.length > 0) {
    console.log(chalk.gray(`  (${preserved.length} file${preserved.length > 1 ? 's' : ''} preserved)\n`));
  } else {
    console.log('');
  }
}
