# Codex Web Cloud Modernization Guide

## Introduction
This document guides Codex Web Cloud agents who are modernizing the Flappy Bird project while ensuring the game remains deployable as static assets on GitHub Pages. Follow these guidelines to keep the project coherent, maintainable, and compatible with static hosting workflows.

## Modernization Goals
1. Implement the outstanding feature work enumerated in `README.md`, including bird animations, modernized 3D bird and pipe models, a seamlessly repeating background, and power-ups such as speed boosts and invincibility.
2. Design responsive layouts that adapt gracefully from mobile to desktop while preserving gameplay clarity at all breakpoints.
3. Uphold accessibility standards by providing keyboard, pointer, and touch interaction, proper semantic markup, and sufficient color contrast.
4. Maintain GitHub Pages-friendly performance budgets: minimize bundle size, defer non-critical assets, and target fast Time to Interactive on static hosting.

## Tech Stack & Tooling
- Adopt a modern, static-friendly toolchain built around Vite, TypeScript, ESLint, Prettier, and Three.js/WebGL. Vite's static asset pipeline, fast dev server, and straightforward `npm run build` output make it an ideal fit for GitHub Pages.
- Ensure the following npm scripts are available:
  - `npm run dev`
  - `npm run build`
  - `npm run preview`
  - `npm run lint`
  - `npm run test`
  `npm run build` must emit a fully static bundle into `/dist` (or `/docs`) suitable for direct upload to GitHub Pages.
- Provide CDN fallbacks for critical assets when feasible so the game continues to function if bundling fails and the static HTML must load assets directly.

## Project Structure
- Migrate inline logic currently inside `index.html` into TypeScript modules under `src/`, such as `src/game/loop.ts`, `src/game/entities/bird.ts`, `src/game/entities/pipe.ts`, and other domain-specific modules.
- Organize rendering-specific utilities under `src/rendering/` to encapsulate canvas and Three.js concerns.
- Keep deployable HTML templates in the `public/` directory; they should reference built assets emitted during the Vite build.
- Store all runtime assets—`.glb` models, textures, audio files, and sprite sheets—inside `public/assets/` so they are copied verbatim into the static bundle.

## Implementation Guidelines
- Reconcile the legacy 2D canvas loop in `index.html` with the unfinished Three.js prototype in `script.js` by converging on a single module-based game loop that can switch between visual themes (2D sprite-based or 3D-rendered) via configuration.
- Implement smooth animation timing, adaptive difficulty scaling, and reliable collision detection. Ensure accessibility by supporting keyboard and touch controls alongside pointer interactions.
- Keep gameplay deterministic on static hosting: avoid server dependencies and persist high scores or settings using `localStorage` or other browser-native storage.

## Testing & QA
- Provide unit tests for core game logic, including physics, collision detection, and scoring.
- Maintain visual regression snapshots to detect unintended rendering changes when updating assets or themes.
- Enforce linting and formatting via ESLint and Prettier. In pull requests, report all executed test commands (e.g., lint, unit tests, visual tests) so reviewers can verify the checks.

## Deployment Checklist
1. Run `npm run build` to produce the static bundle.
2. If deploying from a `docs/` folder, copy the contents of `dist/` into `docs/` and ensure asset references in `index.html` are correct for GitHub Pages.
3. Verify the production build locally with `npm run preview` before pushing.
4. Commit and push the built assets to the appropriate branch. Keep the root `index.html` backward compatible in case GitHub Pages serves directly from `main`.

## Workflow Tips for Codex Web Cloud Agents
- Always consult `AGENTS.md` files and follow instructions scoped to the files you modify.
- Respect file-level guidance when formatting code, writing documentation, or updating assets.
- Write clear, descriptive commit messages summarizing your changes.
- Prepare pull request descriptions that outline the modifications, highlight testing performed, and reference relevant modernization goals.
