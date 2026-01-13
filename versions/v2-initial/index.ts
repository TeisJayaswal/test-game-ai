#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createProject } from './commands/create.js';
import { runDoctor } from './commands/doctor.js';
import { runLearn } from './commands/learn.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read version from package.json to avoid duplication
const packageJsonPath = join(__dirname, '..', 'package.json');
const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

const program = new Command();

program
  .name('game-ai')
  .description('Create multiplayer Unity games with AI assistance')
  .version(pkg.version);

program
  .command('create')
  .description('Create a new multiplayer game project')
  .argument('[name]', 'Project name')
  .action(createProject);

program
  .command('doctor')
  .description('Check your development environment')
  .action(runDoctor);

program
  .command('learn')
  .description('Interactive tutorials for beginners')
  .action(runLearn);

program.parse();
