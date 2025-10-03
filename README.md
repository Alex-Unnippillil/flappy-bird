# Flappy Bird Modernization Playground

This project experiments with modernizing the classic Flappy Bird gameplay loop using Vite, Three.js, and TypeScript-friendly modules. The repository currently ships the original 2D canvas implementation while preparing infrastructure for a richer 3D renderer.

## Getting Started

```bash
npm install
npm run dev
```

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
