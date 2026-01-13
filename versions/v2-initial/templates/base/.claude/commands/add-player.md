# /add-player

Create a player character that can move around in the game.

## What This Does

Creates a complete player setup with:
- A visible character (capsule by default)
- Movement controls (WASD + mouse look for first-person, WASD for third-person)
- Multiplayer sync (other players see this player move)
- Camera setup appropriate for the game type

## Steps

1. First, check what type of game this is (look at existing camera setup)
2. Create a new Player prefab in Assets/_Game/Prefabs/
3. Add these components:
   - CharacterController (for movement)
   - RealtimeView (for multiplayer)
   - RealtimeTransform (to sync position)
   - PlayerController script (create if needed)
4. Copy the prefab to Assets/Resources/ (required for runtime spawning)
5. Update PlayerSpawner to use the new prefab

## Example Script

```csharp
using UnityEngine;
using Normal.Realtime;

public class PlayerController : MonoBehaviour
{
    [SerializeField] private float moveSpeed = 5f;
    [SerializeField] private float rotateSpeed = 120f;

    private RealtimeView _realtimeView;
    private CharacterController _controller;

    private void Awake()
    {
        _realtimeView = GetComponent<RealtimeView>();
        _controller = GetComponent<CharacterController>();
    }

    private void Update()
    {
        // Only control our own player
        if (!_realtimeView.isOwnedLocallyInHierarchy) return;

        // Get input
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");

        // Rotate
        transform.Rotate(0, horizontal * rotateSpeed * Time.deltaTime, 0);

        // Move
        Vector3 move = transform.forward * vertical * moveSpeed * Time.deltaTime;
        move.y = -9.81f * Time.deltaTime; // Gravity
        _controller.Move(move);
    }
}
```

## Explain to User

"I'm creating a player character for you. This includes:
- A capsule shape you'll be able to see
- Controls to move with WASD
- Multiplayer sync so other players see you move

After I'm done, press Play and try moving with WASD!"
