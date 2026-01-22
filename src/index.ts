#!/usr/bin/env node

import { Command } from 'commander';
import { init } from './commands/init.js';
import { createUnity } from './commands/create-unity.js';
import { installCommands } from './commands/install-commands.js';
import { configureMcp } from './commands/configure-mcp.js';
import { runDoctor } from './commands/doctor.js';
import { maybeCheckForUpdates, getCurrentVersion } from './utils/updater.js';

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

// Create Unity project
program
  .command('create-unity [name]')
  .description('Create a new Unity project with Claude and MCP pre-configured')
  .action(createUnity);

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
