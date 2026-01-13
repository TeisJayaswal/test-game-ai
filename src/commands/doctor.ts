import chalk from 'chalk';
import * as fs from 'fs';

interface CheckResult {
  name: string;
  passed: boolean;
  fix: string;
}

export async function runDoctor(): Promise<void> {
  console.log(chalk.blue('\nDiagnosing game-ai setup...\n'));

  const checks = [
    checkUnityProject(),
    checkNormcoreConfig(),
    checkClaudeHelpers(),
  ];

  let allPassed = true;
  for (const check of checks) {
    const icon = check.passed ? '\u2713' : '\u2717';
    const color = check.passed ? chalk.green : chalk.red;
    console.log(`${color(icon)} ${check.name}`);
    if (!check.passed) {
      console.log(chalk.gray(`  ${check.fix}`));
      allPassed = false;
    }
  }

  console.log('');
  if (allPassed) {
    console.log(chalk.green('All checks passed!'));
    console.log(chalk.gray('\nFor Unity MCP setup, run: game-ai install-mcp'));
  } else {
    console.log(chalk.yellow('Some issues found. See above for fixes.'));
  }
}

function checkUnityProject(): CheckResult {
  const passed = fs.existsSync('Assets') && fs.existsSync('Packages');
  return {
    name: 'Unity project',
    passed,
    fix: 'Run this from inside a Unity project, or run: game-ai create my-game'
  };
}

function checkNormcoreConfig(): CheckResult {
  const settingsPath = 'Assets/Normal/Resources/NormcoreAppSettings.asset';
  if (!fs.existsSync(settingsPath)) {
    return { name: 'Normcore configured', passed: false, fix: 'Normcore not found in project' };
  }
  const content = fs.readFileSync(settingsPath, 'utf-8');
  // Use [ \t]* instead of \s* to stay on the same line (avoid matching next line)
  const match = content.match(/_normcoreAppKey:[ \t]*(\S+)/);
  const hasKey = match !== null && match[1] !== undefined && match[1].length > 0;
  return {
    name: 'Normcore app key',
    passed: hasKey,
    fix: 'Set your app key in the NormcoreAppSettings asset'
  };
}

function checkClaudeHelpers(): CheckResult {
  return {
    name: 'Claude helpers installed',
    passed: fs.existsSync('.claude/CLAUDE.md'),
    fix: 'Run: game-ai install-helpers'
  };
}
