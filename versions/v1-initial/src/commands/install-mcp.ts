import chalk from 'chalk';

export interface InstallMCPOptions {
  projectPath?: string;
}

const MCP_PACKAGE_URL_2020_2022 =
  'https://github.com/codemaestroai/advanced-unity-mcp.git?path=Unity2020_2022';
const MCP_PACKAGE_URL_UNITY6 =
  'https://github.com/codemaestroai/advanced-unity-mcp.git?path=Unity6';

export async function installMCP(options: InstallMCPOptions = {}): Promise<void> {
  console.log(chalk.blue('\nUnity MCP Server Installation\n'));

  console.log(chalk.white('The Unity MCP server allows Claude to interact with Unity Editor.'));
  console.log(chalk.white('Installation is done through Unity Package Manager.\n'));

  console.log(chalk.yellow('Step 1: Add the Unity MCP package'));
  console.log(chalk.gray('In Unity, go to Window > Package Manager'));
  console.log(chalk.gray('Click the + button and select "Add package from git URL"'));
  console.log(chalk.gray('\nFor Unity 2020-2022:'));
  console.log(chalk.cyan(`  ${MCP_PACKAGE_URL_2020_2022}`));
  console.log(chalk.gray('\nFor Unity 6+:'));
  console.log(chalk.cyan(`  ${MCP_PACKAGE_URL_UNITY6}`));

  console.log(chalk.yellow('\nStep 2: Open the MCP Dashboard'));
  console.log(chalk.gray('In Unity, go to Code Maestro > MCP Dashboard'));
  console.log(chalk.gray('Choose your connection mode:'));
  console.log(chalk.gray('  - Direct Connection (requires Code Maestro Desktop App)'));
  console.log(chalk.gray('  - Relay Server Connection (works with VS Code, Cursor, Claude Desktop)'));

  console.log(chalk.yellow('\nStep 3: Configure your AI client'));
  console.log(chalk.gray('The MCP Dashboard will help you configure your AI client.'));
  console.log(chalk.gray('For VS Code/Cursor: Click "Install Extension" in the dashboard'));
  console.log(chalk.gray('For Claude Desktop: Follow the relay server setup instructions'));

  console.log(chalk.green('\nOnce configured, Claude will be able to:'));
  console.log(chalk.gray('  - Create and modify GameObjects'));
  console.log(chalk.gray('  - Add and configure components'));
  console.log(chalk.gray('  - Create materials and scripts'));
  console.log(chalk.gray('  - Trigger builds'));
  console.log(chalk.gray('  - Access the Unity Profiler'));

  console.log(
    chalk.blue('\nSource: https://github.com/codemaestroai/advanced-unity-mcp\n')
  );
}
