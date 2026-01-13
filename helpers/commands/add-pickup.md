# /add-pickup

Create a pickup object based on the user's description.

**User's request:** $ARGUMENTS

## What This Does

Creates a pickup object that matches what the user described. Default: a glowing cube.

Examples:
- `/add-pickup` -> Basic glowing cube pickup
- `/add-pickup health potion` -> Health restore item
- `/add-pickup coin worth 10 points` -> Collectible with score
- `/add-pickup weapon sword` -> Weapon the player can use

## Steps

1. Read the user's description above and understand what they want
2. Create new GameObject with appropriate visuals (shape, color, effects)
3. Add components:
   - Collider (set as Trigger)
   - RealtimeView
   - RealtimeTransform
   - Custom Pickup script based on their description
4. If it has special effects (healing, damage, score), implement that logic
5. Save as prefab in Resources/ if it spawns at runtime

## Explain to User

After creating, tell them:
- What pickup you created based on their description
- How to interact with it (walk into it, press E, etc.)
- What effect it has (heals, adds score, equips weapon, etc.)
