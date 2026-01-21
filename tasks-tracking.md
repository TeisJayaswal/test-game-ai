# Unity Vibe Coding Agent - Task Tracking

Based on PRD Deliverable Timeline

---

## Completed Tasks (Reference Only)

### Tuesday (Teis) - DONE
- [x] Finish Minecraft demo
- [x] Finish Golf demo
- [x] Show demos to Max

### Wednesday/Thursday (Teis) - DONE
- [x] Design CLI architecture (decided: nodejs via npm)
- [x] Build one-liner install command (`npm install -g gamekit-cli`)
- [x] Build create-project command (`gamekit init`)
- [x] Build Unity project creation command (`gamekit create-unity`)
- [x] Build Claude commands install command (`gamekit install-commands`)
- [x] Build MCP configure command (`gamekit configure-mcp`)
- [x] Build doctor command (`gamekit doctor`)
- [x] Implement background auto-updater
- [x] Test CLI on Mac
- [x] Demo game that looks production-quality

---

## Linear Tickets to Create

### Blog Post & Content (Max) - Priority: High

#### TICKET-1: Draft blog post outline
- **Owner**: Max
- **Priority**: High (2)
- **Status**: TODO
- **Problem**: Need a compelling blog post to launch the Unity Vibe Coding Agent
- **Tasks**:
  - Draft blog post outline
  - Define key points and narrative:
    - Initial prototyping workflow
    - Systems development workflow
    - Bugfixes workflow
    - Lowering barrier to entry (Lethal Company, Peak examples)
  - Identify needed assets (screenshots, GIFs)
  - Determine where to publish
  - Define call to action

#### TICKET-2: Finalize blog post assets
- **Owner**: Max + Team
- **Priority**: High (2)
- **Status**: TODO
- **Problem**: Blog post needs visual assets to be engaging
- **Tasks**:
  - Create screenshots from demos
  - Create GIFs showing workflows
  - Review and select best assets

---

### GitHub & Publishing (Max + Team) - Priority: High

#### TICKET-3: Create public GitHub repo
- **Owner**: Max + Team
- **Priority**: High (2)
- **Status**: TODO
- **Problem**: Need public repo for open source launch
- **Tasks**:
  - Decide org: @NormalVR vs @normcoreio vs @game-agent
  - Create the repository
  - Upload Claude commands to repo
  - Write README with installation instructions

#### TICKET-4: Build and publish CLI via Bun + GitHub Releases
- **Owner**: Teis
- **Priority**: High (2)
- **Status**: TODO
- **Problem**: CLI needs standalone binaries (no Node.js dependency) distributed via GitHub
- **Tasks**:
  - [x] Confirm final CLI name → **gamekit**
  - [x] Commit uncommitted code (updater, ARCHITECTURE.md)
  - [ ] Update build system to use `bun build --compile`
  - [ ] Create platform binaries (macOS arm64, macOS x64, Linux x64, Windows x64)
  - [ ] Create install.sh for Mac/Linux/WSL
  - [ ] Create install.ps1 for Windows PowerShell
  - [ ] Update auto-updater to check GitHub releases instead of npm
  - [ ] Set up GitHub releases workflow
  - [ ] Verify installation works on all platforms

---

### Launch (Max) - Priority: High

#### TICKET-5: Hacker News launch
- **Owner**: Max
- **Priority**: High (2)
- **Status**: TODO (blocked by TICKET-1, TICKET-3, TICKET-4)
- **Problem**: Need visibility for launch - targeting HN front page
- **Tasks**:
  - Write Show HN post
  - Consult "how to hit front page" guide
  - Decide: Show HN vs regular post
  - Publish blog post
  - Post to Hacker News
  - Monitor comments and measure response

---

### Testing (Teis) - Priority: Medium

#### TICKET-6: Test CLI on Windows
- **Owner**: Teis
- **Priority**: Medium (3)
- **Status**: TODO
- **Problem**: CLI only tested on Mac, need Windows compatibility
- **Tasks**:
  - Test on Windows native
  - Test on Windows WSL
  - Fix any platform-specific issues

---

### Pre-Launch Blockers - Priority: Urgent

#### TICKET-7: Finalize CLI naming and config
- **Owner**: Max (decision) + Teis (implementation)
- **Priority**: Urgent (1)
- **Status**: In Progress
- **Problem**: Multiple blocking decisions needed before launch
- **Tasks**:
  - [x] Confirm final CLI name → **gamekit**
  - [x] Confirm Normcore skip is acceptable for MVP → **Yes, skipping for launch**
  - [x] Commit uncommitted code (updater, ARCHITECTURE.md)
  - [ ] Add gamekit CLI reference to template CLAUDE.md

---

### Post-Launch / Future - Priority: Low

#### TICKET-8: Post-launch improvements
- **Owner**: TBD
- **Priority**: Low (4)
- **Status**: Backlog
- **Problem**: Future enhancements after successful launch
- **Tasks**:
  - Add Normcore support
  - Create curl install script for non-npm users
  - Add "New version available" notification
  - Extend to other models (Gemini, Codex)

---

## Definition of Done (from PRD)

- [x] Demo game that looks production-quality
- [ ] One-command install that actually works (TICKET-4)
- [ ] Blog post written and reviewed (TICKET-1, TICKET-2)
- [ ] YouTube video recorded and edited
- [ ] Template repo public with all Claude helpers (TICKET-3)
- [ ] Front page of Hacker News (TICKET-5)
