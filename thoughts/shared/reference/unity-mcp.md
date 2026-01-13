# Unity MCP Server Reference

Source: https://github.com/codemaestroai/advanced-unity-mcp

## Tools & Capabilities

The MCP server provides control over Unity Editor operations:

- **Editor Control**: Play/pause/stop game, execute menu items, read/clear console messages
- **Asset Management**: Create/modify/delete materials, prefabs, scripts, scenes, GameObjects
- **Build Tools**: Platform switching, build settings, Android Debug Bridge operations
- **Project Config**: Unity packages, settings, PlayerPrefs, external tools
- **Performance**: Unity Profiler access for analyzing bottlenecks

## Installation Requirements

- Unity 2022 or newer
- An MCP-compatible AI client (GitHub Copilot, Cursor, Claude Desktop, etc.)

**Package URLs:**
- Unity 2020-2022: `https://github.com/codemaestroai/advanced-unity-mcp.git?path=Unity2020_2022`
- Unity 6+: `https://github.com/codemaestroai/advanced-unity-mcp.git?path=Unity6`

Install via Unity Package Manager → Add from git URL

## Configuration Options

Two connection modes available in MCP Dashboard:

- **Direct Connection** (Code Maestro Desktop App): Faster, no relay needed
- **Relay Server Connection** (Other clients): Automatic installation for VS Code, Cursor, etc.

Access via: `Code Maestro > MCP Dashboard` in Unity

## Example Usage

- "Create a red material and apply it to a cube"
- "Switch the build target to iOS"
- "Create a script called PlayerMovement with WASD controls"
- "Save the current GameObject as a prefab"
- "Clear all console messages and check for warnings"

## For game-ai CLI

The `install-mcp` command needs to:
1. Add the git URL to Unity Package Manager
2. Guide user to open MCP Dashboard in Unity
3. Help configure connection mode
