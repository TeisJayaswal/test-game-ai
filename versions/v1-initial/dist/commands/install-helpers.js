import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { isValidUnityProject } from '../utils/unity.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function getTemplatesDir() {
    // In development, templates are in src/templates
    // In production (dist), they need to be bundled or copied
    const devPath = path.join(__dirname, '..', 'templates');
    const prodPath = path.join(__dirname, '..', '..', 'src', 'templates');
    if (fs.existsSync(devPath)) {
        return devPath;
    }
    if (fs.existsSync(prodPath)) {
        return prodPath;
    }
    throw new Error('Templates directory not found');
}
function copyDirRecursive(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirRecursive(srcPath, destPath);
        }
        else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
export async function installHelpers(options = {}) {
    const projectPath = options.projectPath ?? process.cwd();
    // Validate it's a Unity project
    if (!isValidUnityProject(projectPath)) {
        throw new Error(`"${projectPath}" does not appear to be a valid Unity project. ` +
            'Expected Assets, Packages, and ProjectSettings directories.');
    }
    console.log(chalk.blue('\nInstalling Claude Code helpers...\n'));
    const templatesDir = getTemplatesDir();
    const claudeTemplateDir = path.join(templatesDir, '.claude');
    const destClaudeDir = path.join(projectPath, '.claude');
    // Copy the .claude template directory
    copyDirRecursive(claudeTemplateDir, destClaudeDir);
    console.log(chalk.green('Claude Code helpers installed successfully!\n'));
    console.log(chalk.white('Created files:'));
    console.log(chalk.gray('  .claude/system_prompt.md - Project context for Claude'));
    console.log(chalk.gray('  .claude/commands/ - Custom slash commands'));
    console.log(chalk.gray('    - /matchmaking - Implement multiplayer matchmaking'));
    console.log(chalk.gray('    - /vr - Set up VR player rig'));
    console.log(chalk.gray('    - /sync-object - Make objects multiplayer-synced'));
    console.log(chalk.gray('    - /build - Create game builds'));
    console.log(chalk.gray('  .claude/subagents/ - Specialized AI assistants'));
    console.log(chalk.gray('    - unity-expert - Unity architecture specialist'));
    console.log(chalk.gray('    - normcore-expert - Normcore networking specialist'));
    console.log(chalk.gray('    - multiplayer-tester - Multiplayer testing specialist'));
    console.log(chalk.yellow('\nNext steps:'));
    console.log(chalk.gray('  1. Open the project folder in Claude Code'));
    console.log(chalk.gray('  2. Claude will use the system prompt automatically'));
    console.log(chalk.gray('  3. Try commands like /matchmaking or /vr'));
}
//# sourceMappingURL=install-helpers.js.map