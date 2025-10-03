# Flappy Bird (Vite + Three.js)

A modernized Flappy Bird prototype powered by Vite, TypeScript, and Three.js. The project builds to static assets that are ready
for GitHub Pages.

## Getting Started

```bash
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
