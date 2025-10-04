# Game Logic Overview

This document summarizes how the classic canvas implementation orchestrates
input, physics, rendering, and HUD updates. Use it as a guide when modifying the
TypeScript entities or tuning gameplay constants.

## Canvas & Timing

- The playfield is locked to a virtual 288×512 resolution. See
  `src/classic/constants.ts` for the pixel math that controls gravity, pipe
  spacing, and HUD typography.
- `ClassicGame` owns a hidden buffer canvas that renders each frame before the
  result is copied to the visible `<canvas>` element. This avoids flicker when
  entities update simultaneously.
- The game loop runs inside `requestAnimationFrame`. Each step converts elapsed
  milliseconds into 60 FPS “delta frames” capped at three frames so the physics
  stay stable after small hitches.

## State Machine

`ClassicGame` cycles through three high-level states:

1. **Intro** – Pipes are idle, the bird idles in place, and instruction banners
   show. Pointer, touch, or keyboard input promotes the game to `running`.
2. **Running** – The main loop scrolls the background and pipes, applies gravity
   to the bird, and performs collision checks. The HUD score increments whenever
   the bird passes a pipe pair.
3. **Game over** – Once the bird collides with a pipe, the floor, or the ceiling,
   gravity continues to apply while the scene slows down. The overlay displays
   medals and run statistics until the player restarts.

`handlePrimaryAction()` transitions between the states: intro → running,
running → flap, and game over → restart.

## Frame Lifecycle

1. **Step** – `step()` receives a timestamp, calculates `deltaFrames`, and
   dispatches to the correct per-state updater.
2. **Update** – `updateRunning()` advances entities at a speed derived from
   `GAME_SPEED`. It also awards points once the bird passes a pipe and triggers
   `triggerGameOver()` on collision.
3. **Render** – `render()` clears the buffer, draws entities in the order
   background → pipes → platform → bird, and overlays either the intro panels,
   the live score, or the game-over summary before copying the frame to the
   on-screen canvas.

## Entities

- **Bird** – Maintains position, velocity, skin, and animation frame. Gravity and
  flap velocity scale with the canvas height so physics remain resolution
  independent. `getBounds()` exposes a rectangle for collisions.
- **PipeField** – Manages an array of `PipePair` instances, spawns new pipes once
  the travelled distance surpasses `PIPE_DISTANCE`, and removes off-screen pipes.
- **PipePair** – Stores the vertical gap, tracks whether it has been passed,
  moves horizontally, and provides pixel-perfect collision detection against the
  bird’s bounds.
- **Background & Platform** – Scroll at different speeds to create parallax and
  expose the ground hit box used during collision checks.

All entities accept an optional sprite sheet so the game can fall back to vector
art if assets fail to load.

## HUD & Scoring

- HUD references are captured during construction and updated through
  `updateHud()`. Score changes also update `localStorage` when a new personal
  best is achieved.
- `drawScore()` renders numbers with either bitmap digits from the sprite sheet
  or vector text sized according to the classic proportions.
- Medal thresholds (10, 20, 30, 40) determine which badge is drawn on the game
  over panel. Medals degrade gracefully if sprite assets are unavailable.

## Audio

`src/classic/assets.ts` uses the Web Audio API to synthesize the original sound
set. Each sound maps to a short sequence of oscillators with exponential
frequency ramps and gain envelopes. `preloadAudio()` primes the audio context so
that the first interaction plays without latency.

## Extending the Game

- To tweak difficulty, adjust constants in `src/classic/constants.ts` (for
  example `PIPE_GAP_SIZE` or `BIRD_WEIGHT`). Entity math scales with the canvas
  dimensions so changes remain consistent across devices.
- Add new HUD elements by extending the markup in `index.html` and wiring the
  elements in `ClassicGame.updateHud()`.
- Use the existing requestAnimationFrame loop to schedule additional systems—for
  instance, particle effects—so they inherit the same delta timing.
