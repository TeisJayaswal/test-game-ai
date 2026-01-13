# /add-player

Create a player character based on the user's description.

**User's request:** $ARGUMENTS

## What This Does

Creates a player character that matches what the user described. Default (if no description): a simple capsule with WASD movement.

Examples:
- `/add-player` -> Basic capsule player with WASD
- `/add-player flying character` -> Player with flight controls
- `/add-player knight with sword` -> Medieval character with attack
- `/add-player top-down shooter` -> Top-down view with shooting

## Steps

1. Read the user's description above and understand what kind of player they want
2. Check existing examples in `Assets/Normal/Examples/` for reference
3. Create a new Player prefab matching their description:
   - Visible character (capsule, or appropriate shape)
   - Movement controls matching the game type (WASD, flight, etc.)
   - Add RealtimeView (for multiplayer)
   - Add RealtimeTransform (to sync position)
   - Create appropriate PlayerController script
4. Copy the prefab to Assets/Resources/ (required for runtime spawning)
5. Make sure there's a PlayerSpawner in the scene

## Explain to User

After creating, tell them:
- What you created based on their description
- How to control the player (WASD, space for jump, etc.)
- How to test it (press Play!)
