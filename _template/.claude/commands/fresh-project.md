---
description: Create a new Unity game project with vibe coding setup fully automated
---

# /fresh-project

Create a fresh Unity project with Claude vibe coding tools, Unity MCP, and Normcore pre-installed.

**Project name:** $ARGUMENTS

## What This Command Does

1. Creates a new Unity project via CLI (no manual Unity Hub needed)
2. Installs Unity MCP and Normcore automatically via manifest.json
3. Copies Claude setup (commands, skills, agents)
4. Opens Unity to resolve packages
5. Ready to build games!

## Automated Process

### Step 1: Validate Input
```bash
PROJECT_NAME="$ARGUMENTS"  # e.g., "space-shooter"
PROJECT_PATH="/Users/teisjayaswal/Normcore/test-games/$PROJECT_NAME"

# Check if name provided
if [ -z "$PROJECT_NAME" ]; then
    echo "Please provide a project name: /fresh-project my-game-name"
    exit 1
fi

# Check if folder exists
if [ -d "$PROJECT_PATH" ]; then
    echo "Folder already exists: $PROJECT_PATH"
    echo "Choose a different name or delete the existing folder."
    exit 1
fi
```

### Step 2: Create Unity Project
```bash
UNITY_PATH="/Applications/Unity/Hub/Editor/6000.1.12f1/Unity.app/Contents/MacOS/Unity"

echo "Creating Unity project at $PROJECT_PATH..."
"$UNITY_PATH" -createProject "$PROJECT_PATH" -quit -batchmode

echo "Unity project created!"
```

### Step 3: Install Packages (Replace manifest.json)
```bash
TEMPLATE_PATH="/Users/teisjayaswal/Normcore/claude-game-template/_template"

# Replace manifest with our pre-configured one (includes MCP + Normcore)
cp "$TEMPLATE_PATH/Packages/manifest.json" "$PROJECT_PATH/Packages/manifest.json"

echo "Packages configured (Unity MCP + Normcore)"
```

### Step 4: Copy Claude Setup
```bash
# Copy .claude folder
cp -r "$TEMPLATE_PATH/.claude" "$PROJECT_PATH/"

# Copy MCP config (connects Claude to Unity)
cp "$TEMPLATE_PATH/.mcp.json" "$PROJECT_PATH/"

# Copy learnings and readme
cp "$TEMPLATE_PATH/LEARNINGS.md" "$PROJECT_PATH/"
cp "$TEMPLATE_PATH/README.md" "$PROJECT_PATH/"

echo "Claude vibe coding setup copied!"
```

### Step 5: Create Project Structure
```bash
mkdir -p "$PROJECT_PATH/Assets/_Game/Scenes"
mkdir -p "$PROJECT_PATH/Assets/_Game/Scripts"
mkdir -p "$PROJECT_PATH/Assets/_Game/Prefabs"
mkdir -p "$PROJECT_PATH/Assets/_Game/Materials"
mkdir -p "$PROJECT_PATH/Assets/Resources"
mkdir -p "$PROJECT_PATH/Assets/Downloaded"

echo "Folder structure created!"
```

### Step 6: Open Unity (resolves packages)
```bash
echo "Opening Unity to resolve packages..."
"$UNITY_PATH" -projectPath "$PROJECT_PATH" &
```

### Step 7: Open Claude Code in New Project
```bash
echo "Opening Claude Code in new project..."

# Open new Terminal window with Claude Code
osascript -e "
tell application \"Terminal\"
    activate
    do script \"cd '$PROJECT_PATH' && claude\"
end tell
"

echo ""
echo "==========================================="
echo "Project created: $PROJECT_PATH"
echo "==========================================="
echo ""
echo "Unity is opening and installing packages."
echo "Claude Code is opening in a new terminal."
echo ""
echo "Once Unity finishes loading:"
echo "1. The MCP server should start automatically"
echo "2. If not, go to Window > Unity MCP > Start Server"
echo ""
echo "Switch to the new Claude terminal and start building!"
```

## Full Script (Run This)

Execute this as a single bash script with the project name:

```bash
#!/bin/bash
PROJECT_NAME="<name>"
PROJECT_PATH="/Users/teisjayaswal/Normcore/test-games/$PROJECT_NAME"
UNITY_PATH="/Applications/Unity/Hub/Editor/6000.1.12f1/Unity.app/Contents/MacOS/Unity"
TEMPLATE_PATH="/Users/teisjayaswal/Normcore/claude-game-template/_template"

# Create Unity project
"$UNITY_PATH" -createProject "$PROJECT_PATH" -quit -batchmode

# Install packages
cp "$TEMPLATE_PATH/Packages/manifest.json" "$PROJECT_PATH/Packages/manifest.json"

# Copy Claude setup
cp -r "$TEMPLATE_PATH/.claude" "$PROJECT_PATH/"
cp "$TEMPLATE_PATH/.mcp.json" "$PROJECT_PATH/"
cp "$TEMPLATE_PATH/LEARNINGS.md" "$PROJECT_PATH/"
cp "$TEMPLATE_PATH/README.md" "$PROJECT_PATH/"

# Create structure
mkdir -p "$PROJECT_PATH/Assets/_Game/Scenes"
mkdir -p "$PROJECT_PATH/Assets/_Game/Scripts"
mkdir -p "$PROJECT_PATH/Assets/_Game/Prefabs"
mkdir -p "$PROJECT_PATH/Assets/_Game/Materials"
mkdir -p "$PROJECT_PATH/Assets/Resources"
mkdir -p "$PROJECT_PATH/Assets/Downloaded"

# Open Unity
"$UNITY_PATH" -projectPath "$PROJECT_PATH" &

# Open Claude Code in new terminal
osascript -e "
tell application \"Terminal\"
    activate
    do script \"cd '$PROJECT_PATH' && claude\"
end tell
"

echo "Done! Project at: $PROJECT_PATH"
echo "Unity and Claude Code are opening..."
```

## Example

User: `/fresh-project asteroid-blaster`

Claude:
1. Runs the automated script
2. Creates `~/Desktop/asteroid-blaster/`
3. Unity opens with MCP + Normcore ready
4. User describes game, Claude builds it

## Notes

- Uses Unity 6000.1.12f1 (latest installed)
- Packages may take 1-2 minutes to resolve on first open
- MCP server should auto-start (if not, Window > Unity MCP)
