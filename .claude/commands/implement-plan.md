---
description: Implement technical plans from thoughts/shared/plans with verification
---

# Implement Plan

You are tasked with implementing an approved technical plan from `thoughts/shared/plans/`. These plans contain phases with specific changes and success criteria.

## CRITICAL: Context Loading (Do This First!)

Before ANY implementation, you MUST read these files in order:

1. `CLAUDE.md` - Project conventions and commands
2. `thoughts/shared/progress.md` - Current state and what's been done
3. `thoughts/shared/session-log.md` - Previous issues and how they were resolved
4. `thoughts/shared/decision-log.md` - Why decisions were made
5. `thoughts/shared/reference/*` - Cached documentation (read all files)
6. The plan file itself (read COMPLETELY)

If the plan has a **Pre-Step: Context Prefetch**, execute it fully before proceeding.

## Getting Started

When given a plan path:
- Read ALL context files listed above
- Read the plan completely and check for any existing checkmarks (- [x])
- **Read files fully** - never use limit/offset parameters, you need complete context
- Think deeply about how the pieces fit together
- Create a todo list to track your progress
- Start implementing if you understand what needs to be done

If no plan path provided, ask for one.

## MANDATORY: Step Completion Checklist

**You MUST complete ALL of these after EVERY step. No exceptions.**

After completing each step (before moving to the next):

```
□ Run code-reviewer agent on new/modified files
□ Add entry to session-log.md (even if "No issues - smooth implementation")
□ Add entry to decision-log.md for any non-obvious choices made
□ Update progress.md with current status
□ Run tests: npm test
□ Run type check: npx tsc --noEmit
□ Check off completed items in plan
```

**If you skip this checklist, you are doing it wrong.**

## Session Logging (Not Just Problems!)

Rename your mental model: this is a **session log**, not just an error log.

**session-log.md** - Log EVERYTHING that happens:
- Issues encountered (even small ones you fixed quickly)
- Workarounds you discovered
- Things that surprised you
- Tests that needed adjustment
- Patterns you noticed

Format:
```
### Entry #N: [Title] (Step X)
**What happened:** [Description]
**Resolution:** [What you did - even if trivial]
**Learning:** [What this teaches for future]
```

**decision-log.md** - Document ALL decisions:
- Why you chose one approach over another
- Trade-offs you considered
- Assumptions you made

Even "obvious" decisions are worth logging - they're only obvious to you right now.

## Implementation Philosophy

Plans are carefully designed, but reality can be messy. Your job is to:
- Follow the plan's intent while adapting to what you find
- Implement each phase fully before moving to the next
- Verify your work makes sense in the broader codebase context
- Update checkboxes in the plan as you complete sections
- **Log issues to session-log.md as you encounter them**

When things don't match the plan exactly, think about why and communicate clearly. The plan is your guide, but your judgment matters too.

If you encounter a mismatch:
- STOP and think deeply about why the plan can't be followed
- Log it to session-log.md
- Present the issue clearly:
  ```
  Issue in Phase [N]:
  Expected: [what the plan says]
  Found: [actual situation]
  Why this matters: [explanation]

  How should I proceed?
  ```

## Fallback Strategies

When common issues occur:

**npm install fails:**
1. Check Node.js version: `node --version` (need 18+)
2. Clear cache: `npm cache clean --force`
3. Delete node_modules and retry
4. Log to session-log.md with exact error

**Tests fail unexpectedly:**
1. Run single test to isolate: `npm test -- path/to/test.ts`
2. Check if it's a test bug or implementation bug
3. Use tdd-runner agent for systematic debugging
4. Log root cause to session-log.md

**TypeScript errors:**
1. Run `npx tsc --noEmit` for full error list
2. Use typescript-builder agent for systematic fixes
3. Fix in dependency order (types first, then usage)

**Build fails:**
1. Check tsconfig.json is valid
2. Ensure all imports resolve
3. Check for circular dependencies

## Verification Approach

After implementing a phase:
- Run the success criteria checks (`npm test`, `npx tsc --noEmit`, `npm run build`)
- Fix any issues before proceeding
- Update progress.md with current status
- Check off completed items in the plan file itself using Edit
- **Pause for human verification**: After completing all automated verification for a phase, pause and inform the human that the phase is ready for manual testing. Use this format:
  ```
  Phase [N] Complete - Ready for Manual Verification

  Automated verification passed:
  - [List automated checks that passed]

  Please perform the manual verification steps listed in the plan:
  - [List manual verification items from the plan]

  Let me know when manual testing is complete so I can proceed to Phase [N+1].
  ```

If instructed to execute multiple phases consecutively, skip the pause until the last phase. Otherwise, assume you are just doing one phase.

Do not check off items in the manual testing steps until confirmed by the user.

## MANDATORY: Agent Usage

**Use these agents proactively, not just when stuck:**

| Agent | WHEN to use (mandatory) |
|-------|------------------------|
| `code-reviewer` | After completing each step - review all new files |
| `tdd-runner` | When any test fails - don't fix manually, use the agent |
| `typescript-builder` | When any type error occurs |
| `unity-project-expert` | Before creating Unity project files |

**How to invoke:** Use the Task tool with the appropriate agent.

Example workflow for Step 2 (Init Command):
1. Write tests (TDD)
2. Implement code
3. Tests pass? → Invoke `code-reviewer` on new files
4. Log to session-log.md
5. Update progress.md
6. Move to Step 3

## If You Get Stuck

When something isn't working as expected:
1. Log the issue to session-log.md immediately (BEFORE trying to fix)
2. Invoke the appropriate agent (tdd-runner, typescript-builder, etc.)
3. Let the agent help systematically
4. Log the resolution to session-log.md
5. Consider if the codebase has evolved since the plan was written
6. Check reference/ folder for relevant documentation
7. If still stuck, present the mismatch clearly and ask for guidance

## Resuming Work

If the plan has existing checkmarks:
- Read progress.md to understand current state
- Read session-log.md for any unresolved issues
- Trust that completed work is done
- Pick up from the first unchecked item
- Verify previous work only if something seems off

Remember: You're implementing a solution, not just checking boxes. Keep the end goal in mind and maintain forward momentum.
