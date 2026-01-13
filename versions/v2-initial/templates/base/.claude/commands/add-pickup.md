# /add-pickup

Create an object that players can pick up and interact with.

## What This Does

Creates a pickup object with:
- A visible shape (cube by default)
- Detection for when player gets close
- Pick up / drop functionality
- Multiplayer sync (all players see who has it)

## Steps

1. Create new GameObject with desired shape
2. Add components:
   - Collider (set as Trigger)
   - Rigidbody (set isKinematic = true)
   - RealtimeView
   - RealtimeTransform
   - Pickup script (create)
3. Create Pickup.cs with:
   - OnTriggerEnter to detect player
   - Ownership request on pickup
   - Parent to player hand/position
   - Drop on button press
4. Save as prefab in Assets/_Game/Prefabs/

## Example Script

```csharp
using UnityEngine;
using Normal.Realtime;

public class Pickup : MonoBehaviour
{
    private RealtimeView _realtimeView;
    private Transform _holder;
    private bool _isHeld;

    private void Awake()
    {
        _realtimeView = GetComponent<RealtimeView>();
    }

    private void OnTriggerEnter(Collider other)
    {
        // Only the local player can pick up
        var playerView = other.GetComponentInParent<RealtimeView>();
        if (playerView != null && playerView.isOwnedLocallyInHierarchy && !_isHeld)
        {
            PickUp(other.transform);
        }
    }

    private void PickUp(Transform holder)
    {
        _realtimeView.RequestOwnership();
        _holder = holder;
        _isHeld = true;
        transform.SetParent(holder);
        transform.localPosition = new Vector3(0.5f, 0, 0.5f);
    }

    private void Update()
    {
        if (_isHeld && _realtimeView.isOwnedLocallyInHierarchy)
        {
            if (Input.GetKeyDown(KeyCode.E))
            {
                Drop();
            }
        }
    }

    private void Drop()
    {
        transform.SetParent(null);
        _holder = null;
        _isHeld = false;
    }
}
```

## Explain to User

"I'm creating a pickup object. When your player walks up to it, you'll pick it up automatically. Press E to drop it. Other players will see you holding it too!

The object uses Normcore's ownership system - when you pick it up, you 'own' it, so your game controls where it goes."
