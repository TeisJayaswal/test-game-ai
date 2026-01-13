import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { createUnityProjectStructure } from '../utils/unity.js';
const DEFAULT_PROJECT_NAME = 'my-game';
const GITIGNORE_CONTENT = `# Unity generated
[Ll]ibrary/
[Tt]emp/
[Oo]bj/
[Bb]uild/
[Bb]uilds/
[Ll]ogs/
[Uu]ser[Ss]ettings/

# MemoryCaptures can get large, so exclude them
[Mm]emoryCaptures/

# Recordings can get large, so exclude them
[Rr]ecordings/

# Asset meta data
*.pidb.meta
*.pdb.meta
*.mdb.meta

# Crashlytics generated
crashlytics-build.properties

# Built application
*.apk
*.aab
*.unitypackage
*.app

# IDE specific
.idea/
.vs/
*.csproj
*.unityproj
*.sln
*.suo
*.tmp
*.user
*.userprefs
*.pidb
*.booproj
*.svd
*.pdb
*.mdb
*.opendb
*.VC.db

# OS generated
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Normcore
*.normcore

# Claude Code
.claude/mcp-logs/
`;
export async function initProject(name, options = {}) {
    const projectName = name ?? DEFAULT_PROJECT_NAME;
    const cwd = options.cwd ?? process.cwd();
    const projectPath = path.join(cwd, projectName);
    // Check if directory already exists
    if (fs.existsSync(projectPath)) {
        throw new Error(`Directory "${projectName}" already exists`);
    }
    console.log(chalk.blue(`Creating Unity project: ${projectName}...`));
    // Create Unity project structure
    await createUnityProjectStructure(projectPath, {
        vr: options.vr,
        multiplayer: options.multiplayer ?? true,
    });
    // Create .gitignore
    fs.writeFileSync(path.join(projectPath, '.gitignore'), GITIGNORE_CONTENT);
    console.log(chalk.green(`\nProject "${projectName}" created successfully!`));
    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.gray(`  1. Open the project in Unity: ${projectPath}`));
    console.log(chalk.gray('  2. Unity will import packages automatically'));
    console.log(chalk.gray('  3. Create your Normcore app at https://dashboard.normcore.io'));
    console.log(chalk.gray('  4. Run: game-ai install-helpers (to add Claude Code support)'));
}
//# sourceMappingURL=init.js.map