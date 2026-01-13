#!/usr/bin/env node

import { Command } from 'commander';
import { createProject } from './commands/create.js';
import { installMCP } from './commands/install-mcp.js';
import { installHelpers } from './commands/install-helpers.js';
import { runDoctor } from './commands/doctor.js';

const program = new Command();

program
  .name('game-ai')
  .description('AI-powered Unity game development with Normcore')
  .version('0.1.0');

program
  .command('create')
  .description('Create a new Unity project with Normcore')
  .argument('<name>', 'Project name')
  .action(createProject);

program
  .command('install-mcp')
  .description('Install and configure Unity MCP server for Claude')
  .action(installMCP);

program
  .command('install-helpers')
  .description('Install Claude Code helpers (.claude directory)')
  .action(installHelpers);

program
  .command('doctor')
  .description('Diagnose setup issues')
  .action(runDoctor);

program.parse();
