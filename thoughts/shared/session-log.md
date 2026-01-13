# Session Log

This file tracks EVERYTHING that happens during implementation - not just problems, but all observations, decisions made on the fly, workarounds discovered, and patterns noticed.

**Purpose:** Learning and improvement. Even "trivial" entries are valuable.

---

## Entry Format

```markdown
### Entry #N: [Title] (Step X)
**What happened:** [Description of situation]
**Resolution:** [What you did - even if trivial]
**Learning:** [What this teaches for future]
```

---

## V1 Session Notes (Archived)

V1 implementation is in `versions/v1-initial/`. Key issues encountered:
1. ESM mocking limitation with `os.platform()` → Used dependency injection
2. Gitignore pattern format → Updated test assertions for regex
3. Template path resolution (dev vs prod) → Added path fallback logic

---

## V2 Implementation

### Session Start: 2026-01-12

### Entry #1: Pre-Step Context Prefetch (Pre-Step)
**What happened:** Fetched Normcore documentation from normcore.io, which redirected to docs.normcore.io (308 redirect). Saved quick start guide and realtime API docs to reference folder.
**Resolution:** Used the redirect URL as instructed by WebFetch tool. Documentation successfully cached.
**Learning:** Normcore docs are at docs.normcore.io, not normcore.io/documentation. Update plan URLs if creating future plans.

### Entry #2: Project Setup (Step 0)
**What happened:** Created package.json, tsconfig.json, vitest.config.ts. Used tsx instead of ts-node for ESM compatibility (ts-node has ongoing ESM issues). npm install succeeded with 4 moderate vulnerabilities (typical for npm projects).
**Resolution:** Setup completed successfully. All verification steps pass.
**Learning:** tsx is more reliable than ts-node for ESM projects. The plan specified ts-node but tsx works better in practice.

### Entry #3: CLI Foundation (Step 1)
**What happened:** Created stub command files (create.ts, doctor.ts, learn.ts) and updated index.ts to import from them. Also incorporated code-reviewer feedback from Step 0: fixed version duplication, added `files` field and `prepublishOnly` script to package.json.
**Resolution:** All tests pass, type check clean. CLI structure matches the plan.
**Learning:** The plan's Step 1 is mostly structural - actual implementations come in Steps 2-4.

### Entry #4: Create Command (Step 2)
**What happened:** Implemented create.ts with inquirer prompts and validation functions. Also implemented template.ts utility (Step 6) since create depends on it. Created tests for validateProjectName and validateAppKey.
**Resolution:** All 11 tests pass. Create command has full interactive flow but needs templates (Step 3) before end-to-end testing.
**Learning:** Steps are interdependent - Step 2 needs Step 6 (template utils) which I implemented ahead of schedule. The plan order could be optimized.

### Entry #5: Security Fixes (Step 2)
**What happened:** Code reviewer identified critical security issues in template.ts: path traversal vulnerability and symlink attack vulnerability. Also found process.chdir() doesn't work in Vitest workers.
**Resolution:** Added sanitizeTemplateName() to prevent path traversal in template names, validateDestPath() to ensure destination is within cwd, and symlink skipping in copyDirRecursive(). Rewrote tests to not use process.chdir(). All 13 tests pass.
**Learning:** Always validate user input for path operations. Vitest workers don't support process.chdir() - need different testing strategies.

### Entry #6: Game Templates (Step 3)
**What happened:** Created base template (.claude, .gitignore, README) and third-person template (Unity project with Normcore scripts: PlayerController, PlayerSpawner, CameraFollow, RoomManager). User requested skipping other templates (first-person, vr, top-down, empty).
**Resolution:** Limited create command to only offer third-person template. Updated CreateAnswers type. All tests pass.
**Learning:** Start with one working template, add others later. Better to have one complete template than many incomplete ones.

---

## V3 Planning

### Session Start: 2026-01-12 (continued)

### Entry #7: V2 Architecture Analysis (Planning)
**What happened:** Picked up from handoff document. Previous session identified that v2's approach of generating C# scripts as text files is fundamentally flawed. Unity needs real `.prefab`, `.unity`, `.meta` files with GUIDs and serialized component data. The `sample/` folders already contain complete working Unity projects.
**Resolution:** Wrote `thoughts/shared/plans/game-ai-v3.md` with corrected approach: copy sample folders directly, create Unity project wrapper (Packages/, ProjectSettings/), inject App Key into Realtime prefab YAML, add .claude helpers.
**Learning:** Understanding the target platform (Unity) deeply before designing is critical. The v2 plan assumed Unity projects could be generated from scripts, but Unity's serialization format requires actual prefab files with component references and GUIDs.

### Entry #8: Sample Structure Analysis (Planning)
**What happened:** Examined `sample/Hoverbird_Player/` structure. Found complete Unity project with:
- `Realtime + Hoverbird Player.prefab` - Contains `_obsoleteAppKey` field at line 47 (injection target)
- `Realtime + Hoverbird Player.unity` - Scene file
- `Resources/Hoverbird Player.prefab` - Player prefab for Realtime.Instantiate
- `Scripts/` - C# scripts
- `Hoverbird Character/` - Art assets (prefab, materials, textures, models, shaders, animations)
**Resolution:** Documented exact structure in v3 plan. The samples are self-contained and just need Unity project wrapper files.
**Learning:** The samples ARE the templates. They have all GUIDs, component references, and art assets intact. Much simpler to copy than generate.

---

## Retrospective Notes

_Patterns and learnings across entries_

**V2→V3 Key Insight:** Unity projects are not just code - they're serialized data with internal references (GUIDs, fileIDs). You can't generate a Unity project by writing C# scripts; you need the actual prefab/scene files that link everything together. The samples in `sample/` are complete working projects that bypass this problem entirely.
