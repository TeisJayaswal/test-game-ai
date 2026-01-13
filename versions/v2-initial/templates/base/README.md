# {{PROJECT_NAME}}

A multiplayer game built with Unity and Normcore, created with game-ai.

## Getting Started

1. **Open in Unity Hub** - Add this project and open it
2. **Wait for packages** - Unity will import Normcore and other packages
3. **Open the Game scene** - Go to `Assets/_Game/Scenes/Game.unity`
4. **Press Play** - Your game should work!

## Testing Multiplayer

To test multiplayer:
1. Build a standalone player (File > Build And Run)
2. Press Play in the editor
3. Both instances will connect to the same room

## Building with Claude Code

Open this folder in Claude Code to get AI assistance with your game:
- `/add-pickup` - Add objects players can pick up
- `/add-player` - Create or modify the player character
- `/fix` - Get help with errors and bugs
- `/explain` - Learn about Unity and Normcore concepts

## Project Structure

```
Assets/
└── _Game/
    ├── Scenes/     - Game levels
    ├── Scripts/    - Your C# code
    ├── Prefabs/    - Reusable objects
    └── Materials/  - Visual materials

Assets/Resources/   - Prefabs that can spawn at runtime (multiplayer)
```

## Normcore App Key

Your Normcore App Key: `{{APP_KEY}}`

If you need a new key, get one at https://dashboard.normcore.io

## Resources

- [Normcore Documentation](https://docs.normcore.io)
- [Unity Manual](https://docs.unity3d.com/Manual/)
- [game-ai GitHub](https://github.com/normalvr/game-ai)
