<!-- File Overview: This markdown file documents README.md. -->

# Flappy Bird Web App

A polished, fully offline-capable recreation of the classic Flappy Bird experience built with TypeScript, HTML5 Canvas, and modern tooling. The project is structured for maintainability, extensibility, and developer productivity, making it a solid reference for browser-based arcade games and PWA implementations.


<img width="425" height="791" alt="image" src="https://github.com/user-attachments/assets/dc707bdc-aee8-4f45-a213-0709870f04de" />

## Table of Contents

1. [Key Features](#key-features)
2. [Architecture Overview](#architecture-overview)
3. [Getting Started](#getting-started)
4. [Available Scripts](#available-scripts)
5. [How to Play](#how-to-play)
6. [Project Structure](#project-structure)
7. [Core Game Systems](#core-game-systems)
8. [Configuration](#configuration)
9. [Progressive Web App Capabilities](#progressive-web-app-capabilities)
10. [Development Workflow](#development-workflow)
11. [Browser Support](#browser-support)

## Key Features

- **Authentic Gameplay** – Pixel-perfect physics, timing, and pacing that mirror the original Flappy Bird challenge.
- **Installable PWA** – Ships with a manifest, icons, and service worker for install-once, play-anywhere convenience.
- **Offline-First** – Aggressive caching delivers a seamless experience without a network connection.
- **Responsive by Design** – Layout and input handling adapt to phones, tablets, and desktops.
- **Immersive Audio** – Low-latency sound effects powered by the Web Audio API.
- **Persistent Scores** – Local storage keeps track of personal bests across sessions.
- **60 FPS Rendering** – Optimized draw cycle and sprite batching keep animations smooth.

## Architecture Overview

The application follows a modular architecture centered around the `Game` class (`src/game.ts`) and a lightweight screen manager. Major building blocks include:

| Layer | Responsibility |
| --- | --- |
| **Entry Point** | `src/index.ts` bootstraps assets, instantiates the game, and binds global listeners. |
| **Game Loop** | `Game` orchestrates update and render ticks, timekeeping, and screen transitions. |
| **Screens** | Located in `src/screens/`, each screen encapsulates UI state (intro, gameplay, etc.) and implements a common interface. |
| **Models** | Entities in `src/model/` (bird, pipes, background, score) store physics state and rendering logic. |
| **Utilities & Constants** | Shared helpers live in `src/utils/`; tunable values reside in `src/constants.ts`. |
| **Assets & Styles** | Static assets and SCSS styles are organized under `src/assets/` and `src/styles/`. |

Webpack assembles the TypeScript sources, SCSS, and static assets into an optimized bundle. Additional tooling such as Workbox (via `lib/workbox-work-offline`) enables offline caching strategies.

## Getting Started

### Prerequisites

- Node.js **14+** (Node 18+ recommended)
- npm (bundled with Node) or Yarn

### Installation & Local Development

```bash
git clone https://github.com/Alex-Unnippillil/flappy-bird.git
cd flappy-bird
npm install
npm run dev
```

The development server exposes the game at **http://localhost:3000** with automatic browser refresh for rapid iteration.

### Production Build

```bash
npm run build
```

Bundles the application into the `dist/` directory with minified JavaScript, extracted CSS, hashed assets, and a production-ready service worker.

### Deployment

- **GitHub Pages**
  - Ensure the `homepage` field in `package.json` matches your repository slug so that generated asset URLs and social metadata resolve correctly.
  - If you are hosting from a project page (e.g., `https://<user>.github.io/<repo>/`), update the `publicPath` inside `webpack.config.js` (see the `WebpackManifestPlugin` configuration) to mirror the subdirectory and keep asset manifests consistent.
  - Run [`npm run build`](#production-build) and publish the contents of `dist/` to the `gh-pages` branch (or serve them via GitHub Actions). Keep the generated `service-worker.js` at the root of that branch so its scope covers the entire game.

- **Netlify / Vercel**
  - Configure the build command as [`npm run build`](#production-build) and set the publish/output directory to `dist/`.
  - Disable framework-specific adapters so the project is treated as a static export. On Vercel, pick the “Other” framework preset; on Netlify, leave the “functions” directory blank.
  - Verify that the deployed URL matches the `homepage` (or override it via environment variables) to keep the precache manifest and service worker scope aligned with the live origin.

- **Static File Hosting (S3, Cloud Storage, Nginx, etc.)**
  - Upload the entire `dist/` folder to your bucket or web root without changing its structure; the generated manifest, icons, and service worker expect their relative paths.
  - Serve the files over HTTPS with proper caching headers (short-lived for HTML, long-lived for hashed assets) while allowing the `service-worker.js` file to be fetched with the default scope (served from the root alongside `index.html`).
  - When hosting from a subdirectory, mirror that path in both `package.json#homepage` and the Webpack `publicPath` setting before running the build to avoid broken asset URLs and out-of-scope service worker registrations.

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Runs Webpack in watch mode with BrowserSync-powered live reloading. |
| `npm run start` | Alias for `npm run dev`. |
| `npm run build` | Generates a production build via Webpack. |
| `npm run lint` | Runs ESLint with the project ruleset. |
| `npm run prettier-format` | Applies Prettier formatting to supported file types. |

## How to Play

1. Press **Space** (desktop) or **tap** (touch devices) to flap and gain altitude.
2. Navigate through pipe gaps without colliding with obstacles or the ground.
3. Each successful pass awards a point; the session ends on collision.

### Input Methods

- **Desktop** – Spacebar, left mouse button, or touchpad tap.
- **Mobile** – Single-finger tap anywhere on the game canvas.

## Project Structure

```
flappy-bird/
├── src/
│   ├── abstracts/          # Base classes and shared interfaces
│   ├── assets/             # Sprites, audio files, and manifest icons
│   ├── lib/                # Framework integrations (e.g., Workbox helpers)
│   ├── model/              # Core game entities (Bird, Pipe, Background, etc.)
│   ├── screens/            # Screen implementations (IntroScreen, GameScreen)
│   ├── styles/             # SCSS source files
│   ├── utils/              # General-purpose helper functions
│   ├── constants.ts        # Tunable gameplay and system constants
│   ├── events.ts           # Centralized event definitions
│   ├── game.ts             # Main game loop and state manager
│   └── index.ts            # Application entry point
├── types/                  # Shared TypeScript type declarations
├── webpack.config.js       # Build and bundling configuration
├── package.json            # Scripts, dependencies, and metadata
└── tsconfig.json           # TypeScript compiler configuration
```

## Core Game Systems

### Game Loop & Rendering

- Uses `requestAnimationFrame` for a time-synced update/render loop.
- Calculates delta times to ensure consistent physics at varying frame rates.
- Draws sprites to an HTML5 Canvas context with z-ordering for parallax effects.

### Physics & Collision

- Gravity applies continuous downward acceleration.
- Flaps inject an instantaneous upward velocity defined by `BIRD_JUMP_HEIGHT`.
- Rotational tilt is derived from vertical velocity for visual feedback.
- Collision checks use axis-aligned bounding boxes for the bird, pipes, and ground.

### Scoring & Progression

- Score increments on successful traversal of pipe pairs.
- Local storage persists the highest score achieved per device.
- Difficulty pacing derives from configurable pipe spacing and speed variables.

### Audio Pipeline

- Web Audio API plays short-form SFX (flap, score, collision) with minimal latency.
- Audio assets are preloaded to avoid runtime delays.
- Volume and mute toggles are managed per session and cached locally.

## Configuration

Gameplay and system parameters are centralized in `src/constants.ts`. Frequently adjusted values include:

- `GAME_SPEED` – Horizontal scroll velocity of obstacles and background layers.
- `BIRD_JUMP_HEIGHT` – Vertical impulse applied per flap.
- `PIPE_DISTANCE` – Horizontal spacing between consecutive pipe pairs.
- `PIPE_GAP` – Vertical gap size between upper and lower pipes.
- `SFX_VOLUME` – Default master volume for all sound effects.

Modifying these constants enables quick experimentation with difficulty curves and feel.

## Progressive Web App Capabilities

- **Service Worker** – Generated via Workbox to precache core assets and manage runtime caching.
- **App Manifest** – Provides metadata, icons, and splash screens for installability.
- **Offline Mode** – Critical resources are cached on first load, enabling gameplay without connectivity.
- **Add to Home Screen** – Supports installation prompts on compatible mobile and desktop browsers.

## Development Workflow

1. **Code Quality** – Run `npm run lint` before committing; configure editors to auto-run Prettier.
2. **Testing** – Manually exercise gameplay changes in multiple viewport sizes and input methods.
3. **Branching** – Use feature branches (`feature/<description>`) and descriptive commit messages.
4. **Pull Requests** – Summarize gameplay-visible changes and outline manual test steps for reviewers.

## Browser Support

- Chrome / Chromium (desktop & mobile)
- Firefox
- Safari (iOS & macOS)
- Microsoft Edge

The app targets evergreen browsers; ensure service workers and Web Audio are enabled when testing older devices.

