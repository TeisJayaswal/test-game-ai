# Normcore Quick Start Guide

Source: https://docs.normcore.io/essentials/getting-started

## Installation Steps

1. **Download** the latest Normcore package from [dashboard.normcore.io/download](https://dashboard.normcore.io/download)
2. **Import** by dragging the `Normcore.unitypackage` file into Unity's Project tab
3. **Wait** for Unity to recompile—the Normal scoped registry installs automatically

## App Key Setup

To enable multiplayer functionality:

1. Navigate to [dashboard.normcore.io](https://dashboard.normcore.io)
2. Go to the **Apps** tab and select "Create new application"
3. Name your app and confirm creation
4. Copy the generated app key
5. Paste it into the "App Key" field on the **Realtime** component in your scene

## Basic Scene Setup

The documentation provides a ready-made example: open `Normal/Examples/Hoverbird Player` and load the `Realtime + Hoverbird Player` scene. This demonstrates a functional multiplayer setup with player movement (WASD keys, spacebar to jump).

## Connecting to Multiplayer

Once your app key is configured and you hit Play, "Normcore will automatically spin up a game server, connect to it, and spawn a player." Export a standalone build alongside the editor to verify real-time synchronization between multiple clients.

## Next Steps

The guide recommends exploring the Creating a Player Controller guide to build examples from scratch, or advancing to XR and data synchronization topics.
