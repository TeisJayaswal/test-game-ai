# /fix

Help diagnose and fix problems with the game.

## When User Says This

They're stuck on something. Be helpful and patient.

## Diagnostic Steps

1. **Ask what's happening** - "What did you expect vs what's actually happening?"

2. **Check Console** - Look for red errors in Unity Console
   - NullReferenceException - Something isn't connected in Inspector
   - "Room not found" - Normcore connection issue
   - Pink/magenta objects - Missing material/shader

3. **Common Issues:**

   **"Multiplayer doesn't work"**
   - Is the Normcore App Key set? (Check Realtime object)
   - Are both players using the same room name?
   - Does the prefab have RealtimeView?

   **"Player doesn't move"**
   - Is the script on the player?
   - Is isOwnedLocallyInHierarchy check correct?
   - Is CharacterController present?

   **"Other players don't see my movement"**
   - Does player have RealtimeTransform?
   - Is the prefab in Resources folder?
   - Was it spawned with Realtime.Instantiate?

   **"I see errors when I press Play"**
   - Read the error message carefully
   - Click the error to see which script/line
   - Usually a missing reference in Inspector

   **"Objects fall through floor"**
   - Add Collider component to floor
   - Add Collider to falling object
   - Check if Rigidbody isKinematic should be true

   **"Can't see other player"**
   - Both need to be in same room
   - Check if player is being spawned
   - Make sure player prefab has visible mesh

4. **If Still Stuck:**
   - Ask user to describe exactly what they did
   - Have them share the specific error message
   - Walk through step by step

## Tone

Be encouraging! Say things like:
- "Let's figure this out together"
- "That's a common issue, easy fix!"
- "Great question - here's what's happening..."

Never make them feel bad for not knowing something.
