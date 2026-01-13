# Decision Log

This file documents **why** certain technical decisions were made. Useful for learning the reasoning process and for future reference.

---

## How to Read This Log

Each entry explains:
- **Context**: What situation prompted the decision
- **Options Considered**: Alternatives I evaluated
- **Decision**: What I chose
- **Reasoning**: Why this option over others
- **Trade-offs**: What we gave up / risks accepted

---

## Setup Phase Decisions

### Decision #1: Vitest over Jest
**Context:** Choosing a test framework for the CLI tool
**Options:**
1. Jest - Most popular, large ecosystem
2. Vitest - Faster, native TypeScript, Vite-compatible
3. Mocha + Chai - Flexible but more setup

**Decision:** Vitest
**Reasoning:**
- Native TypeScript support (no babel config needed)
- Faster execution (important for TDD red-green-refactor cycle)
- Modern API compatible with Jest (easy to switch if needed)
- Better ESM support

**Trade-offs:** Less ecosystem than Jest, but sufficient for CLI testing.

---

### Decision #2: Commander.js over alternatives
**Context:** CLI framework selection
**Options:**
1. Commander.js - Most popular, mature
2. Yargs - More features, complex
3. Oclif - Full framework, opinionated
4. CAC - Lightweight

**Decision:** Commander.js
**Reasoning:**
- Simple API for our needs (4 commands)
- Well-documented
- Large community = more help available
- The plan already specified it

**Trade-offs:** Less automatic help generation than Oclif.

---

### Decision #3: tsx over ts-node
**Context:** Running TypeScript source files directly in ESM mode
**Options:**
1. ts-node - Traditional choice, specified in plan
2. tsx - Modern alternative with better ESM support

**Decision:** tsx
**Reasoning:**
- ts-node has ongoing issues with ESM modules in Node.js
- tsx "just works" with ESM without configuration hassle
- Faster startup time
- No need for `--esm` flag or experimental flags

**Trade-offs:** Slight deviation from plan, but more reliable developer experience.

---

## Template: Decision Entry

### Decision #N: [Title]
**Context:** [What situation prompted this]
**Options:**
1. [Option A] - [brief description]
2. [Option B] - [brief description]

**Decision:** [What was chosen]
**Reasoning:** [Why this option]
**Trade-offs:** [What we gave up]

---

## Patterns & Learnings

_Recurring patterns noticed during development_

(Will be populated as work progresses)
