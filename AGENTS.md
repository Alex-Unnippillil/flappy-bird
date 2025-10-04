# Codex Web Cloud Modernization Guide

## Project Snapshot
- **Runtime:** Vite + TypeScript/ESM modules feed both the game loop (`src/game/`) and HUD/view layer (`src/hud/`, `src/rendering/`).
- **Game loop:** `src/game/systems/loop.js` orchestrates deterministic state, PRNG, spawning, scoring, and dispatches HUD + renderer updates. State is created in `src/game/systems/state.js` and persists best scores in localStorage. Pipes and bird logic live in `src/game/entities/`.
- **Rendering:** `src/rendering/three/renderer.js` owns the Three.js scene (bird mesh, clouds, pipe pooling, lighting). HUD composition is modularized under `src/hud/` and wired up through `createHudController`.
- **Assets:** Procedural bird + texture generator lives in `tools/generate_bird_assets.py`; outputs to `public/assets/models/` and `public/assets/textures/`. These binaries are intentionally ignored from version control and should be regenerated locally when needed.
- **Build & deploy:** `npm run build` emits to `dist/` with the `/flappy-bird/` base path. `npm run deploy` mirrors `dist/` into `docs/` for GitHub Pages.

## Active Workstreams & Next Steps
1. **Visual polish & animations** – Implement sprite-sheet or GLTF-driven wing flaps, pipe movement easing, camera sway, and background parallax tied into the existing renderer without regressing performance budgets.
2. **Gameplay extensions** – Layer in power-ups (speed boosts, invincibility), adaptive difficulty, and deterministic spawn patterns that stay compatible with `DeterministicPRNG` seeding.
3. **Responsive & accessible HUD** – Continue refining `src/hud/` components for screen reader hints, keyboard navigation, and performance (`docs/hud-perf.md` guidance). Expand on pause/overlay flows.
4. **Testing depth** – Increase Vitest coverage for collision detection, PRNG determinism, HUD adapters, and Three.js asset loaders (`src/rendering/three/assets.ts`).
5. **Asset pipeline** – Replace placeholder bird mesh/pipes with the generated GLB assets and author lighting/material presets that still run inside the static bundle.

Keep this queue in sync when creating or reviewing PRs. Before tackling a large effort, check the upstream GitHub pull request list to avoid duplicate work (mirror PR findings in commit messages or summaries since the remote queue is not visible inside the container).

## Module Map & Conventions
- Place new game systems under `src/game/systems/` and expose them via `index.js` re-exports.
- HUD/UI logic should be encapsulated in `src/hud/components/` with stateful adapters in `src/hud/adapter.ts`.
- Rendering helpers belong in `src/rendering/`; keep Three.js-specific code within `src/rendering/three/` and factor shared utilities into separate modules.
- Runtime assets (audio, textures, models) live under `public/assets/` so Vite can copy them verbatim.
- Avoid mixing CommonJS and ESM—project code uses native ESM via Vite.
- No `try/catch` wrappers around imports (aligns with global instructions).

## Implementation Guidelines
- Reconcile the legacy 2D logic with the Three.js renderer by leaning on the module-based loop. Add configuration toggles rather than branching by file.
- Maintain deterministic gameplay: seed `DeterministicPRNG` via `setDeterministicSeed` in tests/previews and avoid Date.now()-style randomness.
- For HUD updates, follow `docs/hud-perf.md` to keep frequent DOM writes inside contained layers. Prefer CSS `contain` and targeted `will-change` hints.
- Provide keyboard, pointer, and touch interaction parity (`src/main.js` already wires keybindings—extend via shared helpers when adding controls).
- Favor dependency-free browser APIs so builds remain deployable as static assets.

## Testing & QA Expectations
Run relevant checks locally and list them in PR summaries:
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
Use Vitest snapshots cautiously—update alongside meaningful UI/render changes. Keep Three.js unit tests deterministic by mocking timers/PRNG where needed.

## Deployment Checklist
1. `npm run build`
2. Sync `dist/` ➜ `docs/` (`npm run deploy` automates this).
3. `npm run preview -- --host --port 4173` to validate `/flappy-bird/` asset paths locally.
4. Commit updated `docs/` outputs when a deployment change is part of your task. Otherwise leave `docs/` untouched.

## Agent Playbook
- Always read scoped `AGENTS.md` files before editing (this file covers the entire repo).
- Craft clear, descriptive commit messages summarizing your work.
- In PR descriptions, highlight which modernization goals you addressed and what tests ran.
- Coordinate with prior agents by referencing significant architecture changes in summaries (e.g., new renderer modules, HUD flows).
- Leave TODO comments sparingly—prefer tracking actionable follow-ups in documentation or PR notes.
