# Implementation Versions

This folder tracks different implementation attempts for learning and comparison.

## v1-initial (2026-01-12)

**Session:** First implementation attempt
**Result:** MVP complete, 52 tests passing
**Notes:**
- Claude didn't use agents or logging during implementation
- Got into "flow state" and skipped meta-workflow
- Issues encountered but not logged (ESM mocking, gitignore patterns, template paths)

**Learnings applied to v2:**
- Made agent usage mandatory, not "if stuck"
- Renamed dev-log → session-log (log everything, not just problems)
- Added explicit step completion checklist

## v2 (In Progress)

**Plan:** `thoughts/shared/plans/game-ai-v2.md`
**Key changes:**
- Interactive `create` command (replaces `init`)
- Working game templates with C# scripts
- Normcore App Key prompted during setup
- Beginner-focused Claude helpers
- `doctor` and `learn` commands

**Process improvements:**
- Mandatory code-reviewer agent after each step
- Session logging for everything (not just problems)
- Decision logging for all choices

---

## Comparing Versions

To compare implementations:
```bash
diff -r versions/v1-initial/src versions/v2-*/src
```

To run a specific version:
```bash
cd versions/v1-initial
npm install
npm test
npm run build
```
