# Unity MCP Gaps

Feature requests and limitations discovered during autonomous game development sessions.

**Purpose:** Track what MCP features would improve Claude's autonomous Unity development.

---

## Critical (Blocking Autonomous Operation)

### Native Screenshot Capture
**Status:** Workaround implemented (RenderTexture Editor script)
**What's needed:**
```
manage_editor action="screenshot"
  view="game"  // or "scene"
  path="Assets/Screenshots/capture.png"
  resolution=[1920, 1080]  // optional
```
**Returns:** `{ "success": true, "path": "...", "size": 12345 }`
**Why it matters:** Visual verification is essential. Current workaround uses menu item + Editor script, which is indirect.
**Current workaround:** `manage_menu_item action="execute" menu_path="Tools/Take Screenshot"` with custom ScreenshotTool.cs

---

### Custom Script Component Detection
**Status:** No workaround - MCP limitation
**What's needed:** `manage_gameobject action="add_component"` should find project scripts, not just built-in Unity components.
```
manage_gameobject action="add_component"
  target="Player"
  component_type="PlayerController"  // Should find Assets/_Game/Scripts/PlayerController.cs
```
**Why it matters:** Claude creates scripts but can't attach them to GameObjects via MCP. Must use runtime AddComponent or ask user.
**Current workaround:**
- Use `AddComponent<T>()` in code at runtime
- Or ask user to manually add in Inspector

---

### Simulated Input Testing
**Status:** No workaround - cannot verify gameplay
**What's needed:**
```
manage_editor action="simulate_input"
  key="W"
  duration=1.0

manage_editor action="simulate_mouse"
  button="left"
  position=[500, 300]
```
**Why it matters:** Can enter play mode but can't test if player moves, shooting works, etc.
**Current workaround:** None. Must ask user to test manually.

---

## High Priority (Would Significantly Improve Workflow)

### Compilation Wait
**Status:** Using sleep (unreliable)
**What's needed:**
```
manage_editor action="wait_for_compilation"
  timeout=30000
```
**Returns:** `{ "success": true, "duration_ms": 2340 }` or `{ "success": false, "errors": [...] }`
**Why it matters:** After script changes, need to wait for Unity to compile. Sleep is wasteful and sometimes too short.
**Current workaround:** `manage_editor action="sleep" duration=2` (or 3)

---

### Batch GameObject Modification
**Status:** Must modify one at a time
**What's needed:**
```
manage_gameobject action="modify"
  targets=["Wall1", "Wall2", "Wall3", "Wall4"]  // Array support
  modifications={ "material": "Assets/Materials/WallMat.mat" }
```
**Why it matters:** Applying same material to 10 walls requires 10 separate MCP calls. Very slow.
**Current workaround:** Loop through objects one at a time, or create runtime script to batch-apply.

---

### FBX/OBJ to Prefab Conversion
**Status:** Partial workaround (manual steps)
**What's needed:**
```
manage_asset action="convert_to_prefab"
  source="Assets/Downloaded/Models/zombie.fbx"
  destination="Assets/Resources/Prefabs/Zombie.prefab"
```
**Why it matters:** Downloaded 3D models are FBX files that can't be loaded at runtime. Must convert to prefab first.
**Current workaround:** Manual 4-step process:
1. `manage_gameobject action="create"` with prefab_path to FBX
2. `manage_gameobject action="save_as_prefab"`
3. `manage_gameobject action="delete"`
4. `manage_asset action="refresh"`

**Issue:** `manage_gameobject action="create" prefab_path="file.fbx"` sometimes appends `.prefab` incorrectly.

---

### Menu Item Execution Feedback
**Status:** Fire-and-forget, no output
**What's needed:** `manage_menu_item` should capture and return any Debug.Log output from the execution.
```
manage_menu_item action="execute" menu_path="Tools/Take Screenshot"
```
**Current return:** `{ "attempted": true }`
**Desired return:** `{ "success": true, "logs": ["[ScreenshotTool] SUCCESS - ..."] }`
**Why it matters:** Can't tell if menu item actually worked without checking console separately.

---

## Medium Priority (Would Help)

### Runtime Object Inspection
**Status:** Objects destroyed on play stop
**What's needed:** Ability to inspect runtime-generated objects.
```
manage_gameobject action="find"
  name="Hole1_Generated"
  scope="runtime"  // Include objects created during play mode
```
**Why it matters:** Procedurally generated content (courses, levels) can't be inspected after stopping play mode.

---

### Project Settings Access
**Status:** Limited access
**What's needed:**
```
manage_projectsettings action="get"
  setting="activeInputHandler"  // Returns 0, 1, or 2
```
**Why it matters:** Need to detect Input System mode before writing input code. Currently must check manifest.json.

---

### Geometry/Collider Validation
**Status:** Not available
**What's needed:**
```
manage_scene action="check_geometry"
  // Returns gaps in colliders, overlapping objects, etc.
```
**Why it matters:** Procedural level generation can create gaps. Currently must rely on visual inspection.

---

### Asset Verification
**Status:** Not available
**What's needed:**
```
manage_asset action="verify_loadable"
  path="Prefabs/Zombie"  // Check if Resources.Load will work
```
**Returns:** `{ "loadable": true, "type": "GameObject" }` or `{ "loadable": false, "reason": "Not in Resources folder" }`
**Why it matters:** Can't verify if asset setup is correct without runtime test.

---

## Low Priority (Nice to Have)

### Euler Angle Visualization
**What's needed:** Return rotation as direction vector in addition to Euler angles.
**Why it matters:** Euler angles aren't intuitive. "This ramp slopes toward +Z" would be clearer.

### Asset Thumbnail Preview
**What's needed:** Get thumbnail/preview of assets.
**Why it matters:** Would help verify materials/textures without screenshots.

### Scene Diff
**What's needed:** Compare scene state before/after changes.
**Why it matters:** Would help debug issues by seeing exactly what changed.

### Animation Support for Static Models
**Status:** No workaround - significant development effort
**What's needed:** Ability to add simple animations to static models
```
manage_animation action="add_simple"
  target="Bird"
  type="wing_flap"  // or "bob", "rotate", "scale_pulse"
  speed=2.0
```
**Why it matters:** Static models (e.g., birds just floating) look lifeless and unprofessional.
**Current workaround:** Create script with sine wave movement, or find pre-animated models.
**Discovered in:** Western Bird Hunt - birds were "just static 3D models floating around"

### Gameplay Video Recording
**Status:** No workaround - would require significant development
**What's needed:**
```
manage_editor action="record_gameplay"
  duration=5.0
  path="Assets/Screenshots/gameplay.mp4"
```
**Why it matters:** Static screenshots don't capture movement, timing, or game feel.
**Current workaround:** None. User must record manually or rely on written descriptions.
**Discovered in:** Western Bird Hunt - hard to verify "game feel" from static screenshots

---

## Resolved via Workarounds

| Gap | Workaround | Quality |
|-----|------------|---------|
| Screenshot capture | RenderTexture Editor script + menu item | Good |
| Screenshot with UI | MCP Extended take_screenshot_ui tool | Good |
| FBX loading | Manual prefab conversion workflow | Okay |
| Custom components | Runtime AddComponent in code | Okay |
| Input System detection | Check manifest.json for package | Good |
| Model bounds/scale | MCP Extended get_model_bounds tool | Good |
| Audio debugging | MCP Extended list_audio_sources tool | Good |
| .blend conversion | Blender CLI export to FBX | Good |

---

## Template for New Gaps

```markdown
### [Feature Name]
**Status:** [No workaround / Workaround exists / Partial]
**What's needed:**
\`\`\`
[MCP command example]
\`\`\`
**Why it matters:** [Impact on autonomous operation]
**Current workaround:** [If any]
**Discovered in:** [Game/session name]
```

---

*Last updated: January 2026*
*Based on: Mini Golf, Pig Racers, Western Bird Hunt test sessions*
