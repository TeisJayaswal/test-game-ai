# Unity Game Development Learnings

This file tracks issues encountered and improvements made to Claude's Unity development capabilities.

---

## Active Blockers

*Issues currently preventing progress - need solutions*

### Asset Download Limitations
**What happened:** Many free asset sites block automated downloads
- Kenney.nl returns HTML redirect pages instead of ZIP files
- Sketchfab requires login for downloads
- itch.io varies - some work, some require accounts
- Unity Asset Store requires Package Manager (can't auto-download)

**Workaround:** Use verified sources (Polyhaven, OpenGameArt) or provide manual download instructions.

---

## Resolved Issues

*Problems solved - documented for future reference*

### Known Issues (from previous sessions)

**Component name format:** Use short names like `Camera`, `Light`, `Rigidbody` - not `UnityEngine.Camera`.

**Triggers need Rigidbody:** At least one object must have a Rigidbody for OnTriggerEnter to fire. Use isKinematic=true, useGravity=false for non-physics objects.

**Multiplayer prefabs:** Anything spawned at runtime must be in `Resources/` folder.

### Normcore XR Dependency
**Problem:** Normcore package requires XR modules to compile, blocks all scripts.
**Solution:** Normcore is not included by default. Use `/add-multiplayer` when multiplayer is needed.
**Fallback:** If XR errors occur, install XR modules via Unity Hub or remove Normcore:
```
mcp__unity-mcp__manage_packagemanager action="remove_package" package_id="com.normalvr.normcore"
```

### Polyhaven API Downloads Work!
**Discovery:** Polyhaven has a public API with direct download URLs.
**Pattern:**
1. Get files: `curl https://api.polyhaven.com/files/ASSET_NAME`
2. Download: `curl -L -o file.jpg "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/ASSET_NAME/ASSET_NAME_diff_1k.jpg"`
**License:** ALL CC0 - no attribution needed!
**Best for:** High-quality PBR textures, HDRIs

### OpenGameArt Downloads Work
**Discovery:** OpenGameArt.org has reliable direct download links.
**Pattern:** `https://opengameart.org/sites/default/files/FILENAME.zip`
**Best for:** Audio, 2D sprites, some 3D models

### Runtime Audio Loading
**Problem:** AudioClip references on prefabs don't work if asset paths change.
**Solution:** Use Resources.LoadAll for runtime sound loading:
```csharp
AudioClip[] clips = Resources.LoadAll<AudioClip>("SoundFolder");
```
**Folder:** Place sounds in `Assets/Resources/SoundFolder/`

### FBX Files Cannot Be Loaded at Runtime (CRITICAL)
**Problem:** FBX/OBJ files downloaded to `Assets/` cannot be loaded via `Resources.Load<GameObject>()`. Returns NULL.
**Why:** FBX files are source assets that Unity imports - they are NOT prefabs and NOT instantiable.
**Symptoms:**
- `Resources.Load<GameObject>("Models/zombie")` returns null
- `NullReferenceException` when trying to Instantiate
- Works in Editor (drag to scene) but fails at runtime

**Solution:** Convert FBX to Prefab before use:
```
1. manage_gameobject action="create" name="Temp" prefab_path="Assets/Downloaded/Models/model.fbx"
2. manage_gameobject action="save_as_prefab" target="Temp" prefab_path="Assets/Resources/Prefabs/Model.prefab"
3. manage_gameobject action="delete" target="Temp"
4. manage_asset action="refresh"
```

**Then load the prefab:**
```csharp
GameObject prefab = Resources.Load<GameObject>("Prefabs/Model"); // Works!
Instantiate(prefab);
```

**Prevention:**
- Use `/convert-models` command after downloading 3D models
- asset-finder agent now flags FBX files for conversion
- `using-3d-models` skill documents the full pattern

---

## Tooling Gaps (For Autonomous Operation)

*What would have made autonomous game development smoother?*

### Unity MCP Screenshot Capability - SOLVED (via RenderTexture Editor script)
**Type:** mcp-feature
**Situation:** Claude needed to visually verify game appearance
**What went wrong:** `manage_editor action="screenshot"` does not exist in MCP natively.
**Initial attempt:** Used `ScreenCapture.CaptureScreenshot()` but it was unreliable during play mode (async, sometimes didn't create files)
**Solution Implemented:** Editor script using **RenderTexture** for synchronous, reliable capture:
1. `Assets/Editor/ScreenshotTool.cs` is pre-installed via `/fresh-project`
2. Claude triggers via: `manage_menu_item action="execute" menu_path="Tools/Take Screenshot"`
3. Uses RenderTexture to render camera view directly (synchronous)
4. **Verifies file exists** and logs file size as proof of capture
5. Screenshots save to `Assets/Screenshots/screenshot_YYYYMMDD_HHMMSS.png`
6. Claude can read the PNG file to visually verify game state
**Status:** IMPROVED - RenderTexture approach is more reliable than ScreenCapture
**Success indicator:** Look for `[ScreenshotTool] SUCCESS - Screenshot saved: ... (XXXXX bytes)` in console
**Note:** Native MCP support would still be preferable

### Simulated Input Testing - MISSING (High Value)
**Type:** mcp-feature
**Situation:** Claude needed to verify gameplay works (player moves, shooting works, etc.)
**What went wrong:** Claude can enter play mode but cannot simulate player input (WASD, mouse, clicks)
**What would help:**
```
manage_editor action="simulate_input" key="W" duration=1.0
manage_editor action="simulate_mouse" button="left" position=[500, 300]
```
**Priority:** HIGH - Cannot verify gameplay without simulated input
**Workaround:** None. Must ask user to test manually.

### Compilation Wait - Awkward
**Type:** mcp-feature
**Situation:** After creating/modifying scripts, need to wait for Unity compilation
**What went wrong:** Using `sleep` commands is unreliable - sometimes too short, sometimes unnecessarily long
**What would help:**
```
manage_editor action="wait_for_compilation" timeout=30000
```
**Priority:** MEDIUM - Sleep works but is wasteful
**Workaround:** Sleep for 2-3 seconds after script changes

### MCP Cannot Add Custom Script Components - CRITICAL
**Type:** mcp-feature
**Situation:** Claude creates scripts like GolfBall.cs, then tries to add as component
**What went wrong:** `manage_gameobject action="add_component"` only finds built-in Unity components (Rigidbody, Collider, etc.), NOT project scripts
**What would help:** MCP should scan project for MonoBehaviour subclasses:
```
manage_gameobject action="add_component" component_type="GolfBall"  // Should work for custom scripts
```
**Priority:** CRITICAL - Claude creates scripts but can't attach them to GameObjects via MCP
**Workaround:**
- Use `AddComponent<T>()` in code at runtime
- Or ask user to manually add components in Inspector

### Input System Detection - MISSING
**Type:** skill / auto-detection
**Situation:** Claude generates input code, but Unity 6 defaults to new Input System
**What went wrong:** Generated `Input.mousePosition` code, but project uses `Mouse.current.position`
**What would help:** Auto-detect input system before writing input code:
```
// Check PlayerSettings for activeInputHandler
// 0 = Legacy, 1 = New Input System, 2 = Both
```
**Priority:** HIGH - Input errors are common in Unity 6 projects
**Workaround:** Check for Input System package in manifest.json, or catch errors and fix

### Screenshot Workaround - SOLVED
**Type:** mcp-feature (resolved)
**Situation:** Previous ScreenshotHelper.cs MonoBehaviour approach failed
**What went wrong:** Required adding component to scene, module issues, etc.
**Solution:** Use **Editor script with MenuItem** instead:
- Editor scripts don't need scene components
- MenuItem can be triggered via `manage_menu_item` MCP command
- ScreenCapture works in Editor context without module issues
**Status:** RESOLVED - See "Unity MCP Screenshot Capability" above
**Implementation:** `Assets/Editor/ScreenshotTool.cs` with `[MenuItem("Tools/Take Screenshot")]`

<!-- IMPORTANT: After any friction or failure, document what tooling would have helped -->

<!-- Template:
### [Gap Name]
**Type:** skill / command / hook / agent / mcp-feature / permission
**Situation:** What was Claude trying to do?
**What went wrong:** What failed or required manual intervention?
**What would help:** Describe the ideal tool/skill/capability
**Priority:** high / medium / low
**Workaround used:** How Claude got past it (if at all)
-->

---

## Improvement Ideas

*Specific skills, commands, or hooks to implement*

<!-- Template:
### [Idea Name]
**Type:** skill / command / hook / agent
**Trigger:** When would this be useful?
**What it does:**
**Priority:** high / medium / low
-->

---

## Session Log

*Brief notes from each game-building session*

### Session: Autonomous Operation (Jan 2026)
**Goal:** Enable Claude to build, test, and iterate on games without user intervention
**Added:**
1. `/screenshot` command - Visual verification of game view
2. `scene-awareness` skill - Auto-capture state before/after changes
3. `verify-changes` skill - Auto test-fix loop after modifications
4. `quality-gate` skill - Checklist before declaring work "done"
5. `self-improvement` skill - Report tooling gaps after failures
6. `iterator` agent - Orchestrates build→test→fix cycles
7. Updated hooks to remind Claude of autonomous behaviors
8. Added Read/Write/Edit/Glob/Grep permissions for full autonomy
**Impact:** Claude can now iterate until quality is high, verify its own work visually, and report what tooling would help improve the system.

### Session: Toolkit Enhancement (Jan 2026)
**Goal:** Add automations to reduce manual intervention during game development
**Added:**
1. `/snapshot` command - Full scene state capture for debugging/understanding
2. `/auto-test` command - Automated play mode testing without manual intervention
3. `/rollback` command - Undo recent Claude changes
4. `/preview-assets` command - Preview assets before downloading
5. `quick-tweaks` skill - Fast adjustments to speeds, sizes, colors, difficulty
6. `adding-juice` skill - Visual polish (screen shake, particles, hit flash, etc.)
7. `level-progression` skill - Scene transitions, saves, checkpoints, level select
**Impact:** Significantly reduced need for user to manually test, verify, or intervene during iteration cycles

### Session: FBX Handling Fix (Jan 2026)
**Problem:** FBX files downloaded for 3D models couldn't be loaded at runtime - `Resources.Load()` returns null
**Root cause:** FBX files are source assets, not prefabs. Unity imports them but they aren't instantiable.
**Solution Added:**
1. `/convert-models` command - Converts FBX/OBJ to runtime-ready prefabs
2. `using-3d-models` skill - Documents the FBX→Prefab workflow and patterns
3. Updated `asset-finder` agent to flag 3D models for prefab conversion
4. Added patterns for dynamic model loading in components
**Impact:** 3D model workflow is now documented and automated. Claude will convert FBX to prefabs automatically.

### Session: Screenshot Tool Fix (Jan 2026)
**Problem:** ScreenCapture.CaptureScreenshot() was unreliable during play mode - files often not created
**Test game:** Pig Racers (Mario Kart-style racing)
**Symptoms:**
- Menu item executed but "no new screenshot files" created
- Only one screenshot captured during entire session
- No log output appeared from the tool
**Root cause:** ScreenCapture.CaptureScreenshot() is async and unreliable in Editor play mode
**Solution:**
1. Rewrote ScreenshotTool.cs to use **RenderTexture** approach
2. RenderTexture capture is synchronous - file exists immediately
3. Added file existence verification with size logged
4. Added "List Screenshots" menu item for debugging
5. Added fallback to ScreenCapture if RenderTexture fails
**Success indicator:** `[ScreenshotTool] SUCCESS - Screenshot saved: ... (XXXXX bytes)`
**Other issues found in test:**
- FBX to prefab via MCP still problematic (appends .prefab to path) - used procedural primitives as workaround
- Batch modification needed (10+ individual calls to apply materials)
- Menu item execution gives no feedback beyond "attempted"

### Session: Western Bird Hunt (Jan 2026)
**Test game:** Third-person Red Dead Redemption-style bird hunting
**Outcome:** Partially completed - playable but low quality
**Duration:** ~45 minutes
**Key Issues Found:**
1. **Model scales required trial-and-error** (3 attempts for birds)
   - Solution: Added `get_model_bounds` MCP tool to check scale before spawning
2. **Birds were static floating objects** (no animation)
   - Solution: Documented in MCP_GAPS; need animation support or pre-animated models
3. **Screenshot didn't capture UI**
   - Solution: Added `take_screenshot_ui` MCP tool for full game view
4. **Audio played randomly** (unclear root cause)
   - Solution: Added `list_audio_sources` MCP tool for debugging
5. **.blend files needed manual conversion**
   - Solution: Enhanced using-3d-models skill with Blender CLI workflow
6. **Quality gate didn't check "game feel"**
   - Solution: Added Gate 4 (Game Feel) to quality-gate skill

**Autonomous Systems NOT Used (Should Have Been):**
- scene-awareness: Not used before bird scale changes
- verify-changes: Manual testing instead
- iterator: Not spawned for visual tuning

**New Tools Added:**
- `get_model_bounds` - Check model size before spawning
- `take_screenshot_ui` - Capture screenshot with UI overlay
- `list_audio_sources` - Debug audio configuration
- `audio-debugger` agent - Diagnose audio issues

**Key Insight:** Game "technically worked" but felt bad. Quality gate now requires Game Feel check (Gate 4) to prevent this.

---

## Patterns Discovered

*Reusable patterns for common situations*

### Prefab with Trigger Detection
```
1. Create GameObject
2. Add Collider (set isTrigger=true)
3. Add Rigidbody (isKinematic=true, useGravity=false)
4. Add script with OnTriggerEnter
5. Save to Resources/ if needs runtime spawning
```

### Basic Enemy Setup
```
1. Create visual (primitive or model)
2. Add Collider for physics
3. Add Rigidbody if it moves
4. Add AI script (chase/patrol)
5. Add damage-dealing via triggers
6. Add health/death system
```

### Verified Asset Download (Polyhaven Textures)
```bash
# Get asset info
curl https://api.polyhaven.com/files/rock_ground_02

# Download diffuse texture (1K resolution)
curl -L -o texture_diff.jpg "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/rock_ground_02/rock_ground_02_diff_1k.jpg"

# Download normal map
curl -L -o texture_nor.jpg "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/rock_ground_02/rock_ground_02_nor_gl_1k.jpg"
```

### Verified Asset Download (OpenGameArt Audio)
```bash
# Download directly
curl -L -o sounds.zip "https://opengameart.org/sites/default/files/zombies.zip"

# Verify it's actually a ZIP (not HTML redirect)
file sounds.zip

# Extract
unzip -o sounds.zip
rm -rf __MACOSX  # Clean Mac metadata
```

### Runtime Audio Manager
```csharp
public class AudioManager : MonoBehaviour
{
    public static AudioManager Instance;
    private AudioClip[] clips;

    void Awake()
    {
        Instance = this;
        clips = Resources.LoadAll<AudioClip>("SoundFolder");
    }

    public void PlayRandom()
    {
        if (clips.Length > 0)
        {
            AudioSource.PlayClipAtPoint(clips[Random.Range(0, clips.Length)], transform.position);
        }
    }
}
```

### FBX to Prefab Conversion (MCP)
```
# Convert downloaded FBX to runtime-ready prefab

# Step 1: Create temp object from FBX
manage_gameobject action="create"
  name="TempModel"
  prefab_path="Assets/Downloaded/Models/zombie.fbx"

# Step 2: Save as prefab in Resources
manage_gameobject action="save_as_prefab"
  target="TempModel"
  prefab_path="Assets/Resources/Prefabs/Zombie.prefab"

# Step 3: Delete temp scene object
manage_gameobject action="delete"
  target="TempModel"

# Step 4: Refresh assets
manage_asset action="refresh"

# Now usable at runtime:
# Resources.Load<GameObject>("Prefabs/Zombie")
```

### Dynamic Component Model Loading
```csharp
// When using AddComponent<T>(), SerializeField won't be populated
// Instead, load models in Awake/Start:

public class EnemyVisual : MonoBehaviour
{
    private GameObject modelInstance;

    void Awake()
    {
        // Load prefab (NOT FBX) from Resources
        GameObject prefab = Resources.Load<GameObject>("Prefabs/ZombieModel");
        if (prefab != null)
        {
            modelInstance = Instantiate(prefab, transform);
            modelInstance.transform.localPosition = Vector3.zero;
        }
    }

    void OnDestroy()
    {
        if (modelInstance != null)
            Destroy(modelInstance);
    }
}
```

### Model Scale Discovery Pattern
When working with unknown 3D models, determine scale before spawning:
```
1. Use MCP Extended to get bounds:
   mcp__unity-mcp-extended__get_model_bounds target="Assets/Downloaded/Models/bird.fbx"

2. Check the returned suggested_scale value

3. Apply scale when instantiating:
   GameObject obj = Instantiate(prefab);
   obj.transform.localScale = Vector3.one * suggestedScale;

Alternative fallback (if MCP Extended not available):
- Start with 0.1 scale for unknown models
- Adjust by 10x increments until visible
- Then fine-tune by 2x increments
- Common final scales: 0.01 (massive models), 0.1 (large), 1.0 (normal), 10.0 (tiny)
```
**Learned from:** Western Bird Hunt - bird scales required 3 manual attempts before getting right.

### Blender File Conversion Pattern
Many free assets come as .blend files. Convert to FBX before use:
```bash
# macOS
/Applications/Blender.app/Contents/MacOS/Blender -b model.blend \
  --python-expr "import bpy; bpy.ops.export_scene.fbx(filepath='model.fbx')"

# Windows
blender -b model.blend ^
  --python-expr "import bpy; bpy.ops.export_scene.fbx(filepath='model.fbx')"
```
**Note:** Unity 6 does NOT auto-import .blend files even with Blender installed.
**Learned from:** Western Bird Hunt - downloaded bird models required manual Blender conversion.

### Audio Source Debugging Pattern
When audio plays unexpectedly, check all AudioSources in scene:
```
Use MCP Extended to list audio sources:
  mcp__unity-mcp-extended__list_audio_sources

Common issues:
- playOnAwake=true causing sounds on scene load
- Multiple AudioSources on same object
- AudioSource enabled but clip not assigned

Quick fix checklist:
1. Check all AudioSources for playOnAwake=false
2. Verify sounds only trigger from code (PlayOneShot, Play)
3. Check for duplicate AudioSources
```
**Learned from:** Western Bird Hunt - "sound playing randomly" issue unclear root cause.

### Procedural Character Fallback
When FBX model loading fails, create recognizable shapes from primitives:
```csharp
// Example: Simple pig character from primitives
public static GameObject CreateProceduralPig(Transform parent)
{
    GameObject pig = new GameObject("ProceduralPig");
    pig.transform.SetParent(parent);

    // Body (pink sphere)
    var body = GameObject.CreatePrimitive(PrimitiveType.Sphere);
    body.transform.SetParent(pig.transform);
    body.transform.localScale = new Vector3(1f, 0.8f, 1.2f);
    body.GetComponent<Renderer>().material.color = new Color(1f, 0.75f, 0.8f);

    // Head (smaller sphere)
    var head = GameObject.CreatePrimitive(PrimitiveType.Sphere);
    head.transform.SetParent(pig.transform);
    head.transform.localPosition = new Vector3(0, 0.3f, 0.7f);
    head.transform.localScale = Vector3.one * 0.6f;

    // Snout (cylinder)
    var snout = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
    snout.transform.SetParent(head.transform);
    snout.transform.localPosition = new Vector3(0, 0, 0.4f);
    snout.transform.localRotation = Quaternion.Euler(90, 0, 0);
    snout.transform.localScale = new Vector3(0.4f, 0.2f, 0.4f);

    return pig;
}
```
**Use case:** When 3D model download/conversion fails, game is still playable with placeholder visuals.
