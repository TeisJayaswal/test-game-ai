# Normcore Documentation Reference

Source: https://docs.normcore.io/

## Package Installation

Normcore is imported via Unity package:
1. Download from https://dashboard.normcore.io/download
2. Drag Normcore.unitypackage into Project tab
3. Normcore automatically adds Normal scoped registry to project

**Scoped Registry (added automatically):**
```json
{
  "name": "Normal",
  "url": "https://normcore.io/registry",
  "scopes": ["com.normalvr"]
}
```

**Package Name:** `com.normalvr.normcore`

## Basic Setup Steps

1. Import the Normcore package
2. Create an app at dashboard.normcore.io
3. Get app key from dashboard
4. Add Realtime component to scene
5. Paste app key into Realtime component

## Core Components

### Realtime
- Manages connection to Normcore servers
- Can auto-connect on start ("Join Room On Start")
- Or manually call `Connect(roomName)`
- All clients with same room name join same server

### RealtimeView
- Required on root of synchronized prefabs
- Prefabs must be in Resources folder
- Use `Realtime.Instantiate()` to create networked instances

### RealtimeTransform
- Synchronizes position/rotation/scale
- "Maintain Ownership While Sleeping" for physics objects
- Call `RequestOwnership()` to take control

## Player Controller Pattern

```csharp
// Instantiate with ownership
Realtime.Instantiate(
    prefabName: "Player",
    ownedByClient: true,
    preventOwnershipTakeover: true,
    useInstance: realtime
);

// Filter input by ownership
if (_realtimeView.isOwnedLocallyInHierarchy)
    LocalUpdate();
```

## Room/Matchmaking

- Quickmatch API for automated matching
- Room Server Options for session configuration
- AutoReconnect for connection resilience

## Built-in Components

- RealtimeTransform - position/rotation sync
- RealtimeAvatar - player avatar sync
- Various others for common use cases

## Key Principles

1. Only sync what's necessary (minimize traffic)
2. Use ownership to control who can modify objects
3. Prefabs in Resources folder with RealtimeView on root
4. Test multiplayer early and often
