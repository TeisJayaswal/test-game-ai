#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { init } from './commands/init.js';
import { runDoctor } from './commands/doctor.js';
import { maybeCheckForUpdates, getCurrentVersion, checkForAppliedUpdate } from './utils/updater.js';

// Check if an update was applied in the background
const updatedVersion = checkForAppliedUpdate();
if (updatedVersion) {
  console.log(chalk.green(`✓ Updated to gamekit v${updatedVersion}\n`));
}

// Check for updates in background (non-blocking)
maybeCheckForUpdates();

const program = new Command();

program
  .name('gamekit')
  .description('AI-powered Unity game development with Claude')
  .version(getCurrentVersion());

// Main command - interactive wizard
program
  .command('init')
  .description('Set up a Unity project for AI-powered game development')
  .action(init);

// Doctor - diagnose issues
program
  .command('doctor')
  .description('Diagnose setup issues and check configuration')
  .action(runDoctor);

// Default to init if no command specified
program.action(() => {
  init();
});

program.parse();
