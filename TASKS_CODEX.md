<!-- File Overview: This markdown file contains task stubs tailored for AI coding agents like OpenAI Codex. -->

# Codex Task Stubs

This document curates actionable, well-scoped ideas to help an AI coding agent contribute effectively to the Flappy Bird project. Each stub highlights the motivation, recommended entry points, and expected deliverables so that future automation runs can pick up a task quickly.

---

## 1. Implement Pointer Events Input Pipeline
- **Goal**: Consolidate mouse and touch handling by adopting the Pointer Events API, reducing duplicated logic and improving cross-device consistency.
- **Why it matters**: Pointer Events enable smoother gameplay on hybrid and touch devices while simplifying listener management.
- **Starting Points**:
  - `src/events.ts`
  - `src/screens/intro-screen.ts`
  - `src/screens/game-screen.ts`
- **Definition of Done**:
  - Pointer Events replace existing mouse/touch listeners.
  - Passive listeners are used where appropriate.
  - Regression testing confirms desktop and mobile inputs still function.

## 2. Add Pause and Resume Mechanics
- **Goal**: Introduce a pause overlay allowing players to temporarily stop gameplay and resume without losing progress.
- **Why it matters**: Improves usability on mobile devices where interruptions are common.
- **Starting Points**:
  - `src/game.ts`
  - `src/screens/game-screen.ts`
  - `src/model/bird.ts`
- **Definition of Done**:
  - Pause/resume UI overlay accessible via keyboard and touch.
  - Game loop halts updates while paused and resumes seamlessly.
  - State (score, position, velocity) persists across pause events.

## 3. Expand Score History Tracking
- **Goal**: Persist a per-run score history and surface it on the game over screen.
- **Why it matters**: Provides richer feedback and encourages replayability by showing recent performance trends.
- **Starting Points**:
  - `src/lib/storage`
  - `src/screens/game-screen.ts`
  - `src/screens/intro-screen.ts`
- **Definition of Done**:
  - Scores appended to a capped history list in storage.
  - Game over screen presents recent scores with best run highlighted.
  - Storage keys remain namespaced using `lib/storage` helpers.

## 4. Respect Prefers-Reduced-Motion
- **Goal**: Detect `prefers-reduced-motion` and offer an accessibility toggle to reduce animation intensity.
- **Why it matters**: Makes the game more inclusive for motion-sensitive players while demonstrating PWA best practices.
- **Starting Points**:
  - `src/styles/`
  - `src/game.ts`
  - `src/utils/` (for helper utilities)
- **Definition of Done**:
  - Animations scale down or disable when the media query is active.
  - Players can override the preference via a settings toggle.
  - Preference persists using existing storage utilities.

## 5. Add Update-Available Service Worker Prompt
- **Goal**: Notify users when a new service worker activates and offer a refresh button.
- **Why it matters**: Enhances the PWA experience by making deployments discoverable without manual reloads.
- **Starting Points**:
  - `src/lib/workbox-work-offline`
  - `src/index.ts`
  - `src/styles/`
- **Definition of Done**:
  - Service worker posts a message when an update is ready.
  - UI toast/dialog prompts the player to refresh.
  - Acceptance criteria include offline and online testing scenarios.

---

## Usage Notes
- Treat each stub as a starting brief. Expand acceptance criteria as needed once the task is in progress.
- Keep documentation (README, AGENTS.md) updated when implementing a stub so future agents remain informed.
- Pair tasks with relevant npm scripts (e.g., `npm run lint`, `npm run build`) to validate changes before submission.
