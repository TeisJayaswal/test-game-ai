# Quick Start for New Terminal

Run this command to begin V2 implementation:

```
/implement-plan thoughts/shared/plans/game-ai-v2.md
```

## What's Different in V2

| Aspect | V1 | V2 |
|--------|-----|-----|
| Main command | `init` (empty project) | `create` (interactive, working game) |
| Normcore setup | Manual | Guided with App Key prompt |
| Templates | Empty structure | Working games with scripts |
| Commands | Technical (`/sync-object`) | Beginner (`/add-pickup`, `/fix`) |
| Extras | None | `doctor` and `learn` commands |

## What Will Happen

1. Claude reads all context files (CLAUDE.md, progress.md, session-log.md, decision-log.md, reference/*)
2. Executes Pre-Step: Context Prefetch (fetches Normcore docs if not cached)
3. Begins Step 0: Project Setup
4. Follows TDD: writes tests first, then implementation
5. **MANDATORY:** Uses code-reviewer agent after each step
6. **MANDATORY:** Logs to session-log.md after every step
7. Updates decision-log.md for all choices
8. Pauses at phase completion for manual verification

## If You Want Continuous Execution

Tell Claude: "Execute all steps continuously, only pause at the end or if you hit a blocker. Use agents and log everything as specified."

## Files to Watch

- `thoughts/shared/progress.md` - Current status
- `thoughts/shared/session-log.md` - Everything that happens
- `thoughts/shared/decision-log.md` - Why decisions were made

## If Something Goes Wrong

1. Check session-log.md for the issue
2. Resume with: `/implement-plan thoughts/shared/plans/game-ai-v2.md`
3. Claude will pick up from the last unchecked item
