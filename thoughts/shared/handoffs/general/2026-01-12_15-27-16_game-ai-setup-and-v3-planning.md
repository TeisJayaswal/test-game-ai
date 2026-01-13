---
date: 2026-01-12T15:27:16-08:00
researcher: Claude
git_commit: none
branch: main
repository: game-ai
topic: "game-ai CLI Setup and V3 Planning"
tags: [setup, planning, unity, normcore, cli]
status: complete
last_updated: 2026-01-12
last_updated_by: Claude
type: implementation_strategy
---

# Handoff: game-ai Setup and V3 Architecture Discovery

## Task(s)

| Task | Status |
|------|--------|
| Review game-ai plan and assess feasibility | Completed |
| Set up .claude folder for autonomous work | Completed |
| Create agents for TDD workflow | Completed |
| Make agent usage/logging mandatory (not optional) | Completed |
| Add file write permissions to settings.json | Completed |
| Move v1 implementation to versions/ | Completed |
| Identify fundamental flaw in v2 approach | Completed |
| Write game-ai-v3.md plan | Completed |

**Key Discovery:** V2's approach is fundamentally flawed. It generates C# scripts as text files, but Unity needs real `.prefab`, `.unity`, `.meta` files with GUIDs and serialized component data. The samples in `sample/` are REAL working Unity projects that should be copied directly, not generated.

## Critical References

1. `thoughts/shared/plans/game-ai-v3.md` - **CURRENT plan** (corrected approach using samples as templates)
2. `thoughts/shared/plans/game-ai-v2.md` - Previous plan (flawed approach, generates C# text)
3. `sample/Hoverbird_Player/` - Working Unity sample that IS the template
4. `sample/CrazyRabbit_FPS/` - FPS sample (also a template)
5. `.claude/commands/implement-plan.md` - Updated with mandatory agent usage

## Recent changes

- `.claude/settings.json` - Added Write/Edit permissions for src/**, thoughts/**, etc.
- `.claude/commands/implement-plan.md:9-50` - Added mandatory step completion checklist
- `.claude/commands/implement-plan.md:75-95` - Added mandatory agent usage table
- `thoughts/shared/session-log.md` - Renamed from dev-log.md, reframed as "log everything"
- `thoughts/shared/progress.md` - Reset for v2, now points to v2 plan
- `versions/v1-initial/` - Moved complete v1 implementation here
- `versions/README.md` - Documents version history

## Learnings

### Critical Architecture Insight
**V2's fatal flaw:** It tries to GENERATE Unity files by writing C# scripts. But Unity projects need:
- `.prefab` files (YAML with GUIDs, component references, serialized settings)
- `.unity` scene files (YAML with full scene hierarchy)
- `.meta` files (GUIDs that link scripts to prefabs)
- Scripts attached to GameObjects via prefab serialization

**V3's solution:** Use `sample/` folders AS the templates. They're complete working Unity projects. Just:
1. Copy sample folder into `Assets/`
2. Create Unity project wrapper (Packages/manifest.json, ProjectSettings/)
3. Inject Normcore App Key into Realtime prefab
4. Add .claude helpers

### Process Learnings
- Agents positioned as "use when stuck" get skipped during flow state
- Made agent usage MANDATORY checkpoints, not optional
- Renamed `dev-log.md` → `session-log.md` to encourage logging everything, not just problems
- V1 Claude didn't use agents or logs because things went "smoothly"

## Artifacts

- `.claude/settings.json` - Permissions + hooks configuration
- `.claude/agents/tdd-runner.md` - TDD specialist agent
- `.claude/agents/typescript-builder.md` - TypeScript build agent
- `.claude/agents/integration-tester.md` - E2E testing agent
- `.claude/agents/unity-project-expert.md` - Unity structure knowledge
- `.claude/agents/session-logger.md` - Logging agent
- `.claude/commands/implement-plan.md` - Updated with mandatory checklist
- `.claude/hooks/typecheck.sh` - Auto typecheck after .ts edits
- `thoughts/shared/progress.md` - Progress dashboard
- `thoughts/shared/session-log.md` - Session logging
- `thoughts/shared/decision-log.md` - Decision documentation
- `thoughts/shared/QUICKSTART.md` - Quick start for new sessions
- `thoughts/shared/reference/unity-mcp.md` - Cached MCP docs
- `versions/README.md` - Version history

## Action Items & Next Steps

1. ~~**Write `thoughts/shared/plans/game-ai-v3.md`** with corrected approach~~ **DONE**

2. ~~**Examine sample structure**~~ **DONE** - App Key at `_obsoleteAppKey` field (line 47)

3. **Implement v3** following TDD with mandatory agent usage. Implementation order:
   1. Create `templates/Packages/manifest.json` and `templates/ProjectSettings/`
   2. Write `src/utils/normcore.ts` (app key injection) with tests
   3. Write `src/utils/template.ts` (directory copying) with tests
   4. Rewrite `src/commands/create.ts` for sample copying
   5. Create `templates/.claude/` helpers
   6. Integration test full create flow
   7. Manual test: open in Unity, verify it works

## Other Notes

### Sample Projects Available
- `sample/Hoverbird_Player/` - Third-person hoverboard game
- `sample/CrazyRabbit_FPS/` - First-person shooter

### Key Files in Samples
- `Realtime + *.prefab` - Contains Normcore Realtime component (App Key goes here)
- `Resources/*.prefab` - Player prefabs for Realtime.Instantiate
- `Scripts/*.cs` - Already connected to prefabs via .meta GUIDs
- `*.unity` - Scene files with full hierarchy

### App Key Location
In `sample/Hoverbird_Player/Realtime + Hoverbird Player.prefab`:
```yaml
_obsoleteAppKey:
_normcoreAppSettings: {fileID: 0}
_roomToJoinOnStart: Test Room
```
The `_obsoleteAppKey` field or a NormcoreAppSettings asset is where the user's App Key needs to go.

### Permissions Configured
```json
"Write(src/**)", "Write(package.json)", "Write(thoughts/**)", ...
"Edit(src/**)", "Edit(package.json)", "Edit(thoughts/**)", ...
```
Claude can now write/edit project files without prompting.
