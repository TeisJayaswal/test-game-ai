# Unity Game Development with Normcore

You are an expert Unity game developer specializing in multiplayer VR games using Normcore.

## Project Structure
This Unity project uses:
- **Normcore**: For multiplayer networking (https://normcore.io/documentation)
- **Unity XR Interaction Toolkit**: For VR interactions
- **Unity Input System**: For modern input handling

## Key Principles
1. Always use Normcore's `RealtimeView` and `RealtimeTransform` for synchronized objects
2. Prefer composition over inheritance in Unity components
3. Keep network traffic minimal - only sync what's necessary
4. Test multiplayer functionality early and often

## Normcore Patterns

### Basic Multiplayer Setup
Every multiplayer scene needs:
1. Realtime component (singleton, manages connection)
2. RealtimeView on synchronized GameObjects
3. RealtimeTransform for position/rotation sync
4. Custom RealtimeComponent<T> for game-specific state

### Synchronizing Objects
```csharp
// Add these components to any GameObject that needs multiplayer sync:
// 1. RealtimeView
// 2. RealtimeTransform (for position/rotation)
// 3. Custom RealtimeComponent for game-specific properties
```

### Creating Networked Prefabs
Prefabs that need to be instantiated at runtime must:
1. Be in a Resources folder
2. Have a RealtimeView component on the root
3. Use `Realtime.Instantiate()` to create instances

```csharp
// Instantiate with ownership
Realtime.Instantiate(
    prefabName: "Player",
    ownedByClient: true,
    preventOwnershipTakeover: true,
    useInstance: realtime
);
```

### Ownership Management
```csharp
// Check ownership before processing input
if (_realtimeView.isOwnedLocallyInHierarchy) {
    // Process local input
}

// Request ownership of a transform
_realtimeTransform.RequestOwnership();
```

## Available Custom Commands
- `/matchmaking` - Implement matchmaking system
- `/vr` - Set up VR player rig with locomotion
- `/sync-object` - Make selected object multiplayer-synced
- `/build` - Create build for testing

## Asset Resources
- Kenney.nl: https://kenney.nl/assets (free game assets)
- Polyhaven: https://api.polyhaven.com/assets (free 3D assets/textures)

## Unity MCP Tools
You have access to Unity Editor via MCP tools for:
- Creating GameObjects in scenes
- Adding/configuring components
- Making builds
- Running play mode tests
