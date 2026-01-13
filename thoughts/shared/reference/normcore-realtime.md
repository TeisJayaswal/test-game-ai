# Normcore Realtime API Overview

Source: https://docs.normcore.io/realtime

## Core Purpose
The Realtime API is Normcore's synchronization layer for real-time object state management in Unity. It operates as an abstraction built on the lower-level Room + Datastore API, automating connection management and scene synchronization.

## Connection Methods

**Automatic Connection:**
Realtime will automatically connect to a room when your application starts if "Join Room On Start" is enabled.

**Manual Connection:**
Join a room programmatically using the `Connect()` method with a room name. All clients connecting to identical room names converge on the same server instance.

## Room Management
Clients establish connections to shared room servers based on room identifiers.

## GameObject Synchronization

### RealtimeView Component
Essential foundation—any realtime prefab requires a RealtimeView on its root GameObject. This component enables networked state replication across all connected clients.

### RealtimeTransform Component
Handles position synchronization with unique ownership mechanics. The component includes an "Request Ownership" button in the inspector for claiming synchronization authority.

## Prefab Requirements & Instantiation

**Creation Prerequisites:**
- Must contain RealtimeView on root object
- Must reside in a Resources folder (or use Addressables/custom loaders)
- Standard Unity prefab conventions apply otherwise

**Runtime Instantiation:**
Use `Realtime.Instantiate()` to spawn prefab instances across all clients. This method ensures consistent networked object creation and automatically connects RealtimeComponents for state replication.

## Code Examples

### Player Instantiation with Ownership
```csharp
Realtime.Instantiate(
    prefabName: "Player",
    ownedByClient: true,
    preventOwnershipTakeover: true,
    useInstance: realtime
);
```

### Filtering Input by Ownership
```csharp
if (_realtimeView.isOwnedLocallyInHierarchy)
    LocalUpdate();
```
