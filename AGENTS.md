# AGENTS.md

## Overview

This document provides essential information for AI coding agents (such as GitHub Copilot, OpenAI Codex, and similar tools) to understand, extend, and interact with the Flappy Bird web app project. It is intended to facilitate automated code generation, refactoring, and intelligent assistance.

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

---

## Contact & Support

- For questions, see the Issues page or contact the repository owner.

---

*This file is intended for use by AI coding agents and maintainers to ensure smooth, automated, and collaborative development.*
