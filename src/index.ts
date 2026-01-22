#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { init } from './commands/init.js';
import { installCommands } from './commands/install-commands.js';
import { configureMcp } from './commands/configure-mcp.js';
import { waitForMcp } from './commands/wait-for-mcp.js';
import { updateCommands } from './commands/update-commands.js';
import { runDoctor } from './commands/doctor.js';
import { maybeCheckForUpdates, getCurrentVersion, checkForAppliedUpdate } from './utils/updater.js';
import { areCommandsOutdated } from './utils/template.js';

// Check if an update was applied in the background
const updatedVersion = checkForAppliedUpdate();
if (updatedVersion) {
  console.log(chalk.green(`✓ Updated to gamekit v${updatedVersion}\n`));
}

// Check if commands are outdated in current directory
if (areCommandsOutdated(process.cwd())) {
  console.log(chalk.yellow(`⚡ New commands available! Run \`gamekit update-commands\` to update.\n`));
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
  .description('Create a new Unity game project (interactive wizard)')
  .action(init);

// Install Claude commands
program
  .command('install-commands')
  .description('Install Claude commands, skills, and agents to current directory')
  .action(installCommands);

// Configure MCP
program
  .command('configure-mcp')
  .description('Generate .mcp.json for Claude Code to connect to Unity')
  .action(configureMcp);

// Wait for MCP
program
  .command('wait-for-mcp')
  .description('Wait for Unity to install the MCP package')
  .action(waitForMcp);

// Update commands
program
  .command('update-commands')
  .description('Update Claude commands, skills, and agents to latest version')
  .action(updateCommands);

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
