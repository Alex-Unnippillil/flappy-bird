# Flappy Bird Classic (Vite + Three.js)

This repository contains a modernized Flappy Bird rebuild powered by Vite, TypeScript, and a Three.js renderer. The project keeps the classic pacing and deterministic systems while introducing a modular scene graph, refreshed HUD, and an asset pipeline geared toward GitHub Pages deployment.

## Quick start

```bash
npm install
npm run dev
```

- `npm run dev` launches the Vite development server with hot module replacement so changes in `src/` refresh instantly.
- `npm run build` produces a production build under `dist/`.
- `npm run preview` serves the production build locally using Vite's preview server (ideal for validating the GitHub Pages base path).
- `npm run test` runs the Vitest suite in a JSDOM environment.

Additional quality gates:

- `npm run lint` executes ESLint with the repository ruleset.
- `npm run typecheck` runs the project through `tsc --noEmit`.

## Architecture overview

### Scene bootstrap
- `src/main.ts` wires input handling, HUD overlays, and the game loop bootstrap before mounting the renderer.【F:src/main.ts†L1-L49】
- `src/game/systems/loop.js` orchestrates deterministic ticks, handles spawning, and bridges the renderer plus HUD controllers.【F:src/game/systems/loop.js†L1-L128】
- `src/rendering/three/renderer.js` encapsulates Three.js scene management, including camera configuration, animation mixers, and render passes.【F:src/rendering/three/renderer.js†L1-L200】

### Deterministic systems
- `src/game/systems/prng.ts` exposes the deterministic PRNG used across spawning and physics helpers.【F:src/game/systems/prng.ts†L1-L120】
- The loop ensures randomness flows through the PRNG, clamps physics constants, and updates HUD state in lockstep with simulation ticks.【F:src/game/systems/loop.js†L47-L128】
- Tests under `src/game/systems/prng.test.ts` and `src/game/systems/loop.test.ts` guard deterministic behavior.【F:src/game/systems/prng.test.ts†L1-L120】【F:src/game/systems/loop.test.ts†L1-L160】

### Rendering & assets pipeline
- `src/rendering/three/assets.ts` manages GLTF loading, cloning, and Draco decoding so scenes can be re-used without redundant network requests.【F:src/rendering/three/assets.ts†L1-L120】
- Procedural bird assets and textures are regenerated via `tools/generate_bird_assets.py`, which outputs to `public/assets/` for Vite to serve.【F:tools/generate_bird_assets.py†L1-L120】
- Static runtime assets (audio, textures, models) live under `public/assets/`, and the renderer requests them through `MODEL_URLS` to respect the GitHub Pages base path.【F:src/rendering/three/assets.ts†L17-L44】

## Testing & validation

Run the automated suite before submitting changes:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Vitest uses the configuration in `vitest.config.ts`, providing code coverage reports and a JSDOM environment for renderer and HUD tests.【F:vitest.config.ts†L1-L21】

## Deployment

1. Build the project: `npm run build`.
2. Deploy the latest build to the `docs/` folder with `npm run deploy`, which syncs `dist/` to `docs/` via `scripts/deploy-docs.mjs` for GitHub Pages hosting.【F:scripts/deploy-docs.mjs†L1-L17】
3. Commit the refreshed `docs/` directory. The GitHub Pages workflow in `.github/workflows/static.yml` publishes the static site whenever `main` is updated.【F:.github/workflows/static.yml†L1-L36】
4. Use `npm run preview -- --host --port 4173` to validate the production build locally with the configured base path from `vite.config.ts` (`/flappy-bird/`).【F:vite.config.ts†L1-L16】

Generated documentation lives in `docs/`, which doubles as the GitHub Pages root. Keep the directory in sync with deployments so the published site reflects the latest build artifacts.
