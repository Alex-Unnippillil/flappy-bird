# Project Guidance for Agents

This repository hosts a modernized Flappy Bird remake built with Vite, TypeScript, and Three.js. The goal of this guide is to equip every agent with the context, conventions, and workflows required to contribute safely and consistently.

---

## 1. Repository Overview

| Area | Purpose |
| --- | --- |
| `src/game/` | Deterministic game loop, entity logic (bird, pipes, collision), RNG management, and spawning systems. |
| `src/rendering/` | Three.js scene management, mesh creation, materials, lighting, and render helpers. Keep Three-specific code inside `three/`. |
| `src/hud/` | DOM-based overlays for score, menus, and accessibility flows. Components live in `components/` with adapters in `adapter.ts`. |
| `public/assets/` | Static runtime assets (audio, textures, models). Generated assets should be regenerated locally instead of committed. |
| `docs/` | GitHub Pages deployment output (`npm run deploy`). Only update when a deployment change is explicitly required. |
| `tools/` | Utilities such as `generate_bird_assets.py` for regenerating procedural assets. |
| `scripts/` | Project automation helpers used by CI and deployment scripts. |

Key entry points:
- `src/main.ts` bootstraps the game, renderer, and HUD controller.
- `src/game/systems/loop.ts` orchestrates deterministic ticks, PRNG seeding, and event dispatch.
- `src/rendering/three/renderer.ts` manages the Three.js scene graph and integrates with the game loop.

---

## 2. Coding Conventions

1. **Module format** – Use native ES modules everywhere (`import`/`export`). Never add `require` or `module.exports`.
2. **TypeScript standards** – Prefer explicit types for public APIs. Use interface extensions instead of re-declaring shared shapes. Avoid `any`; use discriminated unions or generics as needed.
3. **Determinism** – Always route randomness through `DeterministicPRNG`. For tests, call `setDeterministicSeed` before invoking spawning or physics helpers.
4. **Renderer boundaries** – Keep Three.js-specific logic in `src/rendering/three/`. Cross-communication with the game loop should use typed events or adapters, not global state.
5. **HUD performance** – Batch DOM writes, leverage CSS `contain`, and reuse nodes. Use `docs/hud-perf.md` as reference for acceptable update frequencies.
6. **Input parity** – Ensure new interactions support keyboard, pointer, and touch. Augment `src/main.ts` input helpers rather than branching per device.
7. **Error handling** – Avoid wrapping imports in `try/catch`. For runtime safety, prefer guard utilities and exhaustive `switch` statements.
8. **File organization** – Add new game systems under `src/game/systems/` and export from its `index.ts`. Renderer helpers belong under `src/rendering/`. Shared utilities go in `src/shared/` (create the directory if missing before scattering helpers elsewhere).
9. **Testing-first mindset** – When adding new behavior, write or update Vitest suites in parallel. Favor deterministic tests by mocking timers and seeds.

---

## 3. Workflow Expectations

1. **Read scoped `AGENTS.md` files** before editing any file. More specific guides may appear deeper in the tree; they override this document where applicable.
2. **Branch hygiene** – Work on feature branches, squash noisy commits locally, and push with descriptive commit messages.
3. **Commit messages** – Use imperative mood and summarize the intent (e.g., `Add easing to pipe spawn animation`). Mention affected subsystems if the change spans multiple areas.
4. **Pull requests** – Summaries must call out modernization goals addressed, list tests executed, and note any follow-up work. Keep the history of previous PR messages intact when working on follow-ups.
5. **Documentation** – Update README or architecture notes whenever you introduce new workflows, configuration flags, or developer steps.
6. **Deployment artifacts** – Only update `docs/` when you intentionally ship a new build. Otherwise leave existing deployment output untouched.

---

## 4. Testing & Quality Assurance

Run relevant checks locally and document them in your final response and PR:

| Command | Purpose |
| --- | --- |
| `npm run lint` | ESLint with project rules. Fix or justify any warnings. |
| `npm run typecheck` | TypeScript type validation. Ensure there are no errors. |
| `npm run test` | Vitest unit and integration suites. Use deterministic seeds/mocks to avoid flakes. |
| `npm run build` | Production build verification. Required before deploying or updating `docs/`. |
| `npm run preview -- --host --port 4173` | Local smoke test for GitHub Pages base path (`/flappy-bird/`). |

If a command cannot run due to environment constraints, record the limitation in your notes and explain why.

---

## 5. Asset Pipeline

- Regenerate bird meshes/textures with `tools/generate_bird_assets.py`. Outputs are intentionally `.gitignore`d; include reproduction steps instead of committing binaries.
- Keep procedural generation deterministic by hardcoding seeds or feeding CLI arguments. Document new flags in the script header comment.
- Ensure generated assets land under `public/assets/` to be picked up by Vite.

---

## 6. Accessibility & UX

- Provide keyboard focus states for all HUD interactions.
- Mirror HUD announcements via ARIA live regions where appropriate (score updates, pause menu, game over).
- Maintain responsive layouts for mobile and desktop. Test breakpoints down to 320px width.
- Ensure color contrasts meet WCAG AA by default. Update `styles.css` utilities if new palettes are introduced.

---

## 7. Collaboration Notes

- Coordinate large refactors by referencing previous architectural decisions within PR descriptions.
- Leave TODOs sparingly; prefer filing follow-up tasks in documentation or project management tools.
- When introducing new dependencies, justify them in the PR and update `package.json`, `package-lock.json`, and any relevant tooling configs.

---

## 8. Quick Start Checklist for Agents

1. Install dependencies: `npm install`.
2. Read this guide and any nested `AGENTS.md` files.
3. Start the dev server: `npm run dev` (use `--host` if testing in a browser container).
4. Run baseline checks (`npm run lint`, `npm run test`, `npm run typecheck`).
5. Implement changes while maintaining deterministic behavior and performance budgets.
6. Update docs/tests as needed.
7. Run final QA commands and document them.
8. Commit using a descriptive message, then prepare a PR summary via the provided tooling.

By following this guide, you help ensure the codebase stays maintainable, deterministic, and ready for deployment. Welcome aboard!
