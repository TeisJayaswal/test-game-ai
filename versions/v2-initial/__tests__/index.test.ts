import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';

describe('CLI', () => {
  const cliPath = path.join(__dirname, '..', 'index.ts');

  it('shows help with all commands', () => {
    const output = execSync(`npx tsx ${cliPath} --help`).toString();

    expect(output).toContain('game-ai');
    expect(output).toContain('create');
    expect(output).toContain('doctor');
    expect(output).toContain('learn');
  });

  it('shows correct version', () => {
    const output = execSync(`npx tsx ${cliPath} --version`).toString();

    expect(output.trim()).toBe('0.2.0');
  });
});
