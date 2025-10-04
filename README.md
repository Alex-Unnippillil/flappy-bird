# Flappy Bird Classic (TypeScript + Canvas)

A TypeScript and Webpack recreation of the original 288×512 Flappy Bird. The
game boots through `src/main.ts`, which wires a responsive canvas, DOM HUD, and
input bindings before handing control to the `ClassicGame` state machine. The
entire experience renders with the Canvas 2D API, ships a deterministic game
loop, and bundles static assets that can be deployed to GitHub Pages or any
static host.

## Features

- **Classic resolution & pacing** – Game constants mirror the original release,
  including pipe gaps, gravity, and base canvas size. The renderer maintains the
  288×512 aspect ratio while scaling the DOM canvas responsively.
- **Deterministic state machine** – `ClassicGame` owns the intro, running, and
  game-over states, keeps an off-screen buffer for flicker-free draws, and
  persists the best score via `localStorage`.
- **Entity-based logic** – Bird physics, scrolling pipes, background parallax,
  and the platform each live in dedicated entity classes so mechanics remain
  isolated and testable.
- **Web Audio synthesis** – Retro sound effects are produced at runtime with the
  Web Audio API; there are no binary audio assets to ship.
- **Accessible HUD** – DOM overlays expose score, best run, and control hints
  with ARIA annotations. Keyboard, pointer, and touch inputs map to the same
  primary action handler.

## Getting Started

```bash
npm install
npm run dev
```

`npm run dev` invokes Webpack in watch mode and serves the generated bundle from
`dist/` via BrowserSync on `http://localhost:3000`. Edit TypeScript or style
files under `src/` to trigger live rebuilds.

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start Webpack in development mode with live reload. |
| `npm run build` | Produce an optimized production bundle in `dist/`. |
| `npm run start` | Alias for `npm run dev`. |
| `npm run lint` | Run ESLint across the TypeScript sources. |

## Project Structure Highlights

- `src/main.ts` – Bootstraps the canvas, hooks up responsive sizing, wires DOM
  HUD elements, and forwards keyboard/touch inputs to the game instance.
- `src/classic/Game.ts` – Central game orchestrator that manages entities,
  animation frames, HUD updates, medals, and high-score persistence.
- `src/classic/entities/` – Renderable actors such as `Bird`, `PipeField`,
  `Background`, and `Platform`. Each class exposes `update` / `draw` to keep
  physics and presentation encapsulated.
- `src/classic/assets.ts` – Synthesizes flap, score, swoosh, hit, and die sound
  effects using oscillator graphs. `preloadAudio()` primes the context so the
  first interaction is responsive.
- `src/classic/spriteSheet.ts` – Lazy-loads the sprite atlas and exposes helpers
  for drawing scaled sprites when the texture is available. Vector fallbacks keep
  the game playable without the atlas.
- `styles.css` – Shared layout for the HUD, stage, and footer rendered around the
  canvas.

## Game Logic Overview

- **Input** – Pointer, touch, and keyboard events all drive `handlePrimaryAction`
  on the active `ClassicGame`. The handler transitions from intro to running,
  triggers bird flaps, or resets from game over depending on the current state.
  Canvas focus management ensures accessibility on desktop browsers.
- **Update loop** – A requestAnimationFrame loop computes frame deltas, advances
  entity state, spawns pipes based on travelled distance, and clamps bird
  velocity. Drawing happens on an off-screen buffer before copying to the visible
  canvas to avoid tearing.
- **Scoring & medals** – Passing a pipe pair increments the score, updates HUD
  counters, and awards tiered medals at 10/20/30/40 points using sprite atlas
  badges when available.
- **Collisions** – `PipeField` owns an array of `PipePair` instances, each of
  which checks bounding boxes against the bird. Platform height is injected so
  ground collisions and gap placement match the classic difficulty curve.
- **Audio cues** – Calls to `playSound()` during flaps, scoring, hits, and state
  transitions schedule oscillator segments with decay envelopes for an 8-bit
  aesthetic.

See [docs/game-logic.md](docs/game-logic.md) for a deeper breakdown of the
state machine, entity lifecycle, and render order.

## Deployment

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Serve the contents of `dist/` from any static host. For GitHub Pages, publish
   the folder to the `gh-pages` branch or copy the files into a tracked `docs/`
   directory before committing.
3. The generated `site.webmanifest` and service worker enable installable PWA
   behavior when hosted over HTTPS.

## Troubleshooting

- **Audio blocked until interaction** – Some browsers suspend the AudioContext
  until the user interacts with the page. Call `preloadAudio()` (already invoked
  during game init) from an input event if you fork the project.
- **Viewport scaling** – The game expects a portrait viewport. Resize logic keeps
  the canvas within 260–420 px wide; adjust the constants in `src/main.ts` if you
  need different bounds.
