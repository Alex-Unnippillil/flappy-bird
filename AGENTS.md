# AGENTS.md

## Overview

This document provides essential information for AI coding agents (such as GitHub Copilot, OpenAI Codex, and similar tools) to understand, extend, and interact with the Flappy Bird web app project. It is intended to facilitate automated code generation, refactoring, and intelligent assistance.

Use this guide alongside the repository README for a complete picture of project capabilities and expectations.

---

## Executive Summary

### What's Solid
- **Clear modular architecture**: `model/`, `screens/`, `lib/`, and `utils/` offer strong separation of concerns, supported by helpers such as `ScreenChanger`, `ParentClass`, `animation/`, `asset-loader/`, and `web-sfx/`.
- **Modern build pipeline**: Webpack + TypeScript + SCSS with HtmlWebpackPlugin meta injection, Workbox `GenerateSW`, and a PWA manifest. Service worker registration (`lib/workbox-work-offline/index.ts`) is production-gated with sensible defaults (`clientsClaim`, `skipWaiting`).
- **Input/state management**: `events.ts` unifies mouse, touch, and keyboard paths while `ScreenChanger` mediates intro/game transitions. `lib/storage` namespaces `localStorage` keys by site path, enabling parallel GitHub Pages deployments.
- **Visual/audio polish**: Sprite atlas support, `SpriteDestructor`, intro/gameplay screens, score banner, and a Web Audio wrapper (`lib/web-sfx`).

### Biggest Opportunities
- **Game loop & performance**: Adopt delta-driven updates separated from rendering, consider high-DPI scaling, optional FPS caps, `document.visibilityState` pauses, reduced per-frame allocations, and progressive `OffscreenCanvas` for heavier rendering.
- **Input**: Prefer Pointer Events to remove duplicate mouse/touch paths, add `touch-action` CSS, and use passive listeners where beneficial.
- **Accessibility & UX**: Respect `prefers-reduced-motion`, provide keyboard focus/roles for canvas UI, high-contrast themes, vibration toggles, orientation hints, and a persistable Settings screen.
- **Record-keeping**: Expand beyond a single high score—track per-run history, periodic personal bests, import/export JSON, Web Share links, and guard against large time deltas for anti-cheat.
- **PWA polish**: Ensure manifest completeness (icons, screenshots, categories, shortcuts), tailor runtime caching per asset type, and surface an “update available” prompt when a new service worker activates.
- **Repository hygiene**: Add a BSD-3-Clause LICENSE, reconcile `package.json` metadata (repository URL, homepage), establish CI for lint/test/build, maintain changelog/releases, add issue/PR templates, and triage existing pull requests.

---

## Project Purpose

A modern, TypeScript-based web recreation of the classic Flappy Bird game, featuring:
- Modular architecture
- Progressive Web App (PWA) support
- Responsive design and cross-platform compatibility
- Modern build tooling (Webpack, TypeScript, SCSS)

---

## Key Architectural Concepts

- **Entry Point**: `src/index.ts` initializes the game, handles asset loading, and manages the main game loop.
- **Game Logic**: Encapsulated in `src/game.ts` (the `Game` class), which manages state, rendering, and user input.
- **Screens**: Game states (intro, gameplay) are managed via the `screen-changer` module and screen classes in `src/screens/`.
- **Models**: Game entities (bird, pipes, background, etc.) are in `src/model/`.
- **Assets**: Sprites, audio, and icons are in `src/assets/`.
- **Utilities**: Helper functions and constants are in `src/utils/` and `src/constants.ts`.
- **Styles**: SCSS stylesheets in `src/styles/`.
- **PWA/Offline**: Service worker and manifest integration via Webpack plugins and `lib/workbox-work-offline`.

---

## Agent Guidance

### 1. **Adding Features**
- Place new game entities in `src/model/`.
- Add new screens to `src/screens/` and register them in the `Game` class.
- Use `src/constants.ts` for global configuration.
- For new assets, add to `src/assets/` and reference them in code.

### 2. **Refactoring**
- Maintain modularity: keep logic in appropriate folders (model, screens, utils, etc.).
- Use TypeScript best practices and update type definitions in `types/` as needed.
- Ensure new code is compatible with the PWA and offline features.

### 3. **Testing & Linting**
- Use `npm run lint` for code quality.
- Format code with `npm run prettier-format`.
- Manual playtesting is required for gameplay changes (no automated tests by default).

### 4. **Build & Run**
- Development: `npm run dev` (hot reload, local server)
- Production: `npm run build` (optimized bundle)
- Output is in the `dist/` directory (created after build).

### 5. **PWA/Offline**
- Service worker logic is in `lib/workbox-work-offline` and configured via Webpack.
- Manifest and icons are auto-generated during build.

---

## Important Files & Directories

- `src/index.ts` — App entry point
- `src/game.ts` — Main game logic
- `src/model/` — Game entities
- `src/screens/` — UI/game screens
- `src/assets/` — Images, audio, icons
- `src/constants.ts` — Game configuration
- `src/utils/` — Helper functions
- `src/styles/` — SCSS styles
- `webpack.config.js` — Build configuration
- `package.json` — Scripts and dependencies
- `types/` — TypeScript type definitions

---

## Coding Standards

- TypeScript (strict mode recommended)
- Modular, single-responsibility classes and functions
- Use ES6+ features
- Prefer functional utilities for stateless logic
- Keep UI and logic decoupled
- Use semantic variable and function names

---

## Extension Points

- **New Game Modes**: Add screens and logic in `src/screens/` and `src/model/`.
- **New Assets**: Place in `src/assets/` and update references.
- **Settings/Options**: Add UI in a new screen, persist with `lib/storage`.
- **Analytics/Telemetry**: Integrate via Webpack plugins or in `src/index.ts`.

---

## Agent-Specific Notes

- Always check for manual edits before overwriting files.
- Validate changes with `npm run lint` and `npm run dev`.
- Document new features in `README.md` and update this file if new agent-relevant patterns are introduced.
- When preparing pull requests, summarize gameplay-visible changes and mention any required manual test steps in the PR description to help reviewers.

### Documentation Updates

- Keep this file synchronized with any new architectural conventions or tooling so future agents inherit accurate guidance.
- If you introduce new scripts or workflows that agents should know about, add them here and cross-reference related README sections.

---

## Contact & Support

- For questions, see the Issues page or contact the repository owner.

---

*This file is intended for use by AI coding agents and maintainers to ensure smooth, automated, and collaborative development.*
