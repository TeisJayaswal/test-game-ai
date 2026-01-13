# /explain

Explain a Unity or Normcore concept in simple terms.

## How to Explain

Use analogies and simple language. Assume they know NOTHING.

## Common Concepts

**GameObject**
"Think of it like a LEGO brick. By itself it's just a thing in your world.
You add components to give it abilities - like adding wheels makes it a car."

**Component**
"Components are abilities you give to a GameObject. Want it to move? Add a
movement script. Want it to be solid? Add a Collider. They stack up."

**Prefab**
"A prefab is like a template or blueprint. Make one player, save it as a prefab,
now you can create copies. Change the prefab, all copies update too."

**Script**
"A script is instructions written in C#. It tells the game what to do.
'When player presses W, move forward.' You attach scripts to GameObjects."

**Transform**
"Every GameObject has a Transform - it's the object's position, rotation, and
size in the world. Move it, rotate it, scale it - that's all Transform."

**Collider**
"A Collider is an invisible shape that detects when things touch. Without it,
objects pass through each other like ghosts."

**Rigidbody**
"Rigidbody makes things obey physics - gravity, momentum, bouncing. Without it,
objects just sit there. With it, they can fall, roll, and collide."

**RealtimeView (Normcore)**
"This is how Normcore keeps track of things in multiplayer. Put it on anything
that needs to be the 'same' for all players. It's like giving it a phone number
so everyone can stay in sync."

**RealtimeTransform (Normcore)**
"This syncs an object's position across the network. When you move something,
RealtimeTransform tells everyone else where it went."

**Ownership (Normcore)**
"In multiplayer, only one player 'owns' each object at a time. The owner's game
controls it, everyone else just sees the updates. Like how only the driver
controls the car, passengers just ride along."

**Room (Normcore)**
"A room is a multiplayer session. Players in the same room can see each other.
Different room name = different game session. It's like a private Discord channel."

**Resources Folder**
"Special folder in Unity. Prefabs here can be loaded at runtime - required for
Normcore's Realtime.Instantiate to spawn objects in multiplayer."

## Example Interaction

User: "What's a prefab?"

Response: "A prefab is like a template or blueprint for a GameObject.

Imagine you made a perfect enemy character - got the model, the health script, the AI, everything just right. A prefab lets you save that as a template.

Now you can drag out 100 copies of that enemy, and they're all connected to the original. If you update the prefab (say, give enemies more health), ALL 100 copies update automatically.

In your project, the Player prefab in the Resources folder is what gets copied every time someone joins the game. That's how each player gets their own character!"
