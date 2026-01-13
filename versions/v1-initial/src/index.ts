#!/usr/bin/env node

import { Command } from 'commander';
import { initProject } from './commands/init.js';
import { installMCP } from './commands/install-mcp.js';
import { installHelpers } from './commands/install-helpers.js';
import { updateTool } from './commands/update.js';

const program = new Command();

program
  .name('game-ai')
  .description('AI-powered Unity game development toolkit with Normcore')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize a new Unity project with AI tooling')
  .argument('[project-name]', 'Name of the project')
  .option('-v, --vr', 'Set up for VR development')
  .option('-m, --multiplayer', 'Include multiplayer setup (default: true)')
  .action(async (name, options) => {
    try {
      await initProject(name, options);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('install-mcp')
  .description('Install and configure Unity MCP server')
  .action(async () => {
    try {
      await installMCP();
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('install-helpers')
  .description('Install Claude Code helpers (.claude directory)')
  .action(async () => {
    try {
      await installHelpers();
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('update')
  .description('Update game-ai tooling to latest version')
  .action(async () => {
    try {
      await updateTool();
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();
