# /add-enemy

Create an enemy or NPC based on the user's description.

**User's request:** $ARGUMENTS

## What This Does

Creates an enemy that matches what the user described. Default: a red cube that chases players.

Examples:
- `/add-enemy` -> Basic chasing enemy
- `/add-enemy zombie that shambles slowly` -> Slow zombie AI
- `/add-enemy turret that shoots at players` -> Stationary shooter
- `/add-enemy friendly NPC shopkeeper` -> Non-hostile NPC

## Steps

1. Read the user's description above and understand the behavior they want
2. Create enemy GameObject with appropriate visuals
3. Add components:
   - NavMeshAgent (for movement) - if it moves
   - RealtimeView
   - RealtimeTransform
   - Custom EnemyAI script matching their description
   - Health script if it can be damaged
4. Set up NavMesh in scene if not already done
5. Configure behavior (patrol, chase, shoot, friendly, etc.)

## Explain to User

After creating, tell them:
- What enemy/NPC you created based on their description
- How it behaves (chases, patrols, stays still, etc.)
- How to interact with it (attack it, talk to it, avoid it, etc.)
