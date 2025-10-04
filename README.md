# Flappy Bird (Vite + Three.js)

A modernized Flappy Bird prototype powered by Vite, TypeScript, and Three.js. The project builds to static assets that are ready
for GitHub Pages.

## Getting Started

```bash
npm install
npm run dev
```

## Scene bootstrap

The Three.js renderer is initialized through `createSceneContext()` found in
`src/core/scene.ts`. Import and call this helper from the Vite entry point to
obtain the shared `scene`, `camera`, and `renderer` instances while the helper
appends the renderer's canvas to the `#app` container:

```ts
import { createSceneContext } from "./core/scene";

const { scene, camera, renderer } = createSceneContext();
```

The helper automatically matches the container size, clamps the pixel ratio for
high-DPI displays, and responds to future `resize` events.

### Available Scripts

- `npm run dev` – Start the Vite development server.
- `npm run build` – Produce the production bundle, including static assets.
- `npm run preview` – Preview the production build locally. Use this to verify GLTF assets load correctly.
- `npm run test` – Execute Vitest suites.
- `npm run lint` – Run ESLint across the project.
- `npm run typecheck` – Validate TypeScript types.

## 3D Asset Pipeline

The repository contains a procedurally generated bird rig for future Three.js rendering. The asset is authored entirely through scripts so it can be reproduced deterministically, and the generated binaries are intentionally omitted from version control to keep the repository lightweight.

- **Source script:** `tools/generate_bird_assets.py`
  - Generates the low-poly mesh (612 triangles) with armature joints `BirdRoot`, `Wing.L`, and `Wing.R`.
  - Creates a 512×512 base-color atlas at `public/assets/textures/bird_atlas.png`.
  - Bakes skinning weights and a 12 fps looping `Flap` animation directly into `public/assets/models/bird.glb`.
  - Keeps the final binary under the 200 KB budget (≈31 KB currently).
- Run the generator after modifying the script (or whenever you need fresh assets). This will recreate `public/assets/models/bird.glb` and `public/assets/textures/bird_atlas.png` locally:

  ```bash
  python tools/generate_bird_assets.py
  ```

- Preview the result in Three.js using Vite’s production server. Ensure the assets have been generated first so the preview can load them successfully:

  ```bash
  npm run build
  npm run preview
  # then open http://localhost:4173/flappy-bird/bird-preview.html
  ```

  The preview page (`bird-preview.html`) loads the model with `GLTFLoader`, instantiates the `Flap` animation, and verifies the rig behaves as expected in the browser. If the preview reports missing assets, re-run the generator above and refresh the page.

## Asset Licensing

The procedural bird model and its texture atlas were authored specifically for this project by the repository maintainers and released under the [Creative Commons Attribution 4.0 International (CC BY 4.0) license](https://creativecommons.org/licenses/by/4.0/). Please credit “Flappy Bird Modernization Team” when reusing the asset.

All other assets retain their original licenses; see subdirectories of `public/assets/` for additional details.
npm ci
npm run dev
```

The dev server runs on Vite's default port (`http://localhost:5173`).

## Quality Checks

```bash
npm run lint
npm run test
npm run typecheck
```

## HUD performance guidelines

Documented HUD performance hints live in [docs/hud-perf.md](docs/hud-perf.md). Review the checklist before adjusting scoreboard, overlay, or control styles so frequent updates stay isolated from the rest of the layout.

## Production Build

```bash
npm run build
```

The production bundle is emitted to `dist/` and respects the `/flappy-bird/` base path required by GitHub Pages.

## Deployment to GitHub Pages

The repository deploys via a committed `docs/` directory that mirrors the Vite build output. From a fresh clone:

```bash
npm ci
npm run deploy
```

The `deploy` script runs the production build and synchronizes `dist/` into `docs/`. Commit and push the updated `docs/` folder to
publish the latest build on GitHub Pages (`https://<username>.github.io/flappy-bird/`).

### Smoke Test

After running `npm run deploy`, launch a local preview to verify that models, textures, and scripts load correctly under the
`/flappy-bird/` prefix:

```bash
npm run preview -- --host --port 4173
```

Visit `http://localhost:4173/flappy-bird/` in a browser. Asset URLs should resolve with the `/flappy-bird/` prefix, matching the
production GitHub Pages site.
