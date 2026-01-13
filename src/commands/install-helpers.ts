import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function installHelpers(): Promise<void> {
  console.log(chalk.blue('\nInstalling Claude Code helpers...\n'));

  const spinner = ora('Copying helpers...').start();

  try {
    // Check we're in a Unity project
    if (!fs.existsSync('Assets')) {
      spinner.fail('Not in a Unity project directory');
      process.exit(1);
    }

    // Copy helpers/ to .claude/
    const helpersPath = getHelpersPath();
    const destPath = path.join(process.cwd(), '.claude');

    copyDirectorySync(helpersPath, destPath);

    spinner.succeed(chalk.green('Claude helpers installed!'));

    console.log(chalk.blue('\nAvailable commands in Claude Code:'));
    console.log(chalk.gray('  /add-player [description]  - e.g., /add-player flying character'));
    console.log(chalk.gray('  /add-pickup [description]  - e.g., /add-pickup health potion'));
    console.log(chalk.gray('  /add-enemy [description]   - e.g., /add-enemy zombie'));
    console.log(chalk.gray('  /fix [problem]             - e.g., /fix player falls through floor'));
    console.log(chalk.gray('  /explain [concept]         - e.g., /explain what is a prefab\n'));

  } catch (error) {
    spinner.fail('Failed to install helpers');
    throw error;
  }
}

function getHelpersPath(): string {
  // In dev: src/commands/install-helpers.ts -> ../../helpers
  // In prod: dist/commands/install-helpers.js -> ../../helpers
  const helpersPath = path.join(__dirname, '..', '..', 'helpers');
  if (fs.existsSync(helpersPath)) {
    return helpersPath;
  }
  throw new Error(`Helpers not found at ${helpersPath}`);
}

function copyDirectorySync(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip symlinks for security
    if (entry.isSymbolicLink()) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirectorySync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
