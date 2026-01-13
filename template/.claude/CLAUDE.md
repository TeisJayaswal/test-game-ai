# Your Multiplayer Game

This is a Unity game project with Normcore multiplayer built-in.

## For Claude: How to Help This User

This user is likely NEW to game development. When helping them:

1. **Use simple language** - Say "create a copy of the player" not "instantiate a prefab"
2. **Give step-by-step instructions** - Include what they'll click and see in Unity
3. **Explain the "why"** - Don't just give code, help them understand it
4. **Celebrate wins** - Game dev is hard, acknowledge their progress!

## Project Structure

- `Assets/Normal/Examples/` - Working example scenes
  - `Hoverbird Player/` - Third-person flying character
  - `Cube Player/` - Simple cube character
  - `VR Player/` - VR multiplayer
- `Assets/Resources/` - Prefabs that spawn at runtime (needed for multiplayer)

## How Multiplayer Works (Simple Version)

1. **Realtime** - The "phone line" connecting players. Lives in the scene.
2. **RealtimeView** - Put this on anything that needs to sync. It's like a name tag.
3. **RealtimeTransform** - Syncs position/rotation. Add this to moving things.
4. **Ownership** - Only ONE player controls each object. Others see the updates.

## Common Tasks

### "Add something the player can pick up"
1. Create a new GameObject (cube, sphere, etc.)
2. Add RealtimeView component
3. Add RealtimeTransform component
4. Create a Pickup.cs script that checks for player collision
5. Put it in Resources/ folder if it needs to spawn at runtime

### "Make the player do something new"
1. Look at the existing player scripts in the example
2. Add new input check in Update()
3. The RealtimeTransform handles syncing automatically

### "Add UI"
1. Create Canvas if none exists
2. Add UI elements (Button, Text, etc.)
3. For multiplayer UI (scores, player list), create a RealtimeModel

## Unity MCP Tools

You have access to Unity Editor via MCP. You can:
- Create/modify GameObjects
- Add/configure components
- Create/modify scripts
- Run play mode
- Create builds

## Normcore Documentation

Full docs: https://normcore.io/documentation
