# Asset Catalog & Pipeline Notes

This document summarizes how visual and audio assets are organized, loaded, and consumed throughout the Flappy Bird codebase. Use it as a field guide when auditing existing sprites or adding new ones.

## Pipeline Overview

* **Primary loader**: `src/asset-preparation.ts` orchestrates asset loading. It relies on `AssetLoader` to fetch raw files, `SpriteDestructor` to slice `atlas.png`, and `WebSfx` to preload audio buffers before the game boots.【F:src/asset-preparation.ts†L6-L109】
* **Sprite cache**: `SpriteDestructor` exposes `cutOut` to name each slice and `asset(key)` to retrieve it later. All atlas keys referenced below must match the identifiers registered during preparation.【F:src/lib/sprite-destructor/index.ts†L15-L87】
* **Audio wrapper**: `WebSfx` (and the helper class `src/model/sfx.ts`) provide volume control and playback for sound effects once their buffers are cached.【F:src/lib/web-sfx/index.ts†L21-L147】【F:src/model/sfx.ts†L1-L41】

---

## Sprite Atlas (`src/assets/atlas.png`)

The atlas is sliced in `asset-preparation.ts`. Keys follow a kebab-case pattern combining feature and variant (e.g., `pipe-green-top`). Game objects retrieve them with `SpriteDestructor.asset(key)`.

### World & Stage Elements

| Atlas key | Description | Consuming module(s) |
| --- | --- | --- |
| `theme-day`, `theme-night` | Full-screen background panels used for the day/night cycle. | `src/model/background.ts` sets the active theme via `SpriteDestructor.asset('theme-*')`.【F:src/model/background.ts†L31-L49】 |
| `platform` | Ground strip that scrolls with the foreground. | `src/model/platform.ts` caches the sprite during `init()` and tiles it in `Display`.【F:src/model/platform.ts†L18-L53】 |
| `pipe-green-top`, `pipe-green-bottom`, `pipe-red-top`, `pipe-red-bottom` | Pipe variants rendered as obstacle pairs. | `src/model/pipe.ts` stores a color map (`green.*`, `red.*`) and swaps during scene generation.【F:src/model/pipe.ts†L34-L64】 |

### Gameplay UI & Banners

| Atlas key | Description | Consuming module(s) |
| --- | --- | --- |
| `banner-flappybird` | Title ribbon on the intro screen. | `src/screens/intro.ts` draws it while waiting for input.【F:src/screens/intro.ts†L29-L64】 |
| `banner-game-over`, `score-board`, `toast-new` | Game over banner, score panel, and “new” badge. | `src/model/score-board.ts` preloads them during `init()`.【F:src/model/score-board.ts†L71-L102】 |
| `banner-game-ready`, `banner-instruction` | “Get Ready” title and tap instructions shown before gameplay starts. | `src/model/banner-instruction.ts` manages fade-out animation with these images.【F:src/model/banner-instruction.ts†L64-L123】 |
| `btn-play`, `btn-ranking`, `btn-rate` | Primary buttons (play, leaderboard, rate). | `src/model/btn-play.ts`, `src/model/btn-ranking.ts`, and `src/model/btn-rate.ts` load the corresponding key in `init()`.【F:src/model/btn-play.ts†L23-L55】【F:src/model/btn-ranking.ts†L1-L18】【F:src/model/btn-rate.ts†L1-L24】 |
| `btn-mute`, `btn-speaker` | Speaker toggle sprites. | `src/model/btn-toggle-speaker.ts` swaps them when muting/unmuting.【F:src/model/btn-toggle-speaker.ts†L1-L48】 |
| `btn-play-icon`, `btn-share`, `btn-menu`, `btn-ok`, `icon-plus` | Extra UI glyphs kept for future menus/sharing prompts. | Currently unused—callouts remain in the atlas for potential screens. Document any new consumer module when activated.【F:src/asset-preparation.ts†L63-L88】 |
| `copyright` | Footer copyright strip from the original asset pack. | Currently unused; include placement details if reinstated.【F:src/asset-preparation.ts†L86-L88】 |

### Birds & Effects

| Atlas key | Description | Consuming module(s) |
| --- | --- | --- |
| `bird-yellow-up/mid/down`, `bird-blue-*`, `bird-red-*` | Three-frame wing cycles for each bird palette. | `src/model/bird.ts` stores frames in `color.frameIndex` maps and animates during flap/wave states.【F:src/model/bird.ts†L88-L132】 |
| `spark-sm`, `spark-md`, `spark-lg` | Particle sprites used when awarding medals. | `src/model/spark.ts` cycles through them while animating spark bursts.【F:src/model/spark.ts†L1-L73】 |

### Numerical Glyphs

| Atlas key pattern | Description | Consuming module(s) |
| --- | --- | --- |
| `number-lg-0` – `number-lg-9` | Large digits rendered during gameplay score. | `src/model/count.ts` seeds the counter with these sprites.【F:src/model/count.ts†L24-L40】 |
| `number-md-0` – `number-md-9` | Medium digits for the score board. | `src/model/score-board.ts` caches them in `images` for both score and best columns.【F:src/model/score-board.ts†L91-L124】 |
| `number-sm-*` | Small digits intended for secondary HUD elements. | Not currently referenced; update this README when wiring them up.【F:src/asset-preparation.ts†L32-L41】 |
| `number.sm-8` | Legacy typo entry kept for backward compatibility with older atlases. Avoid reusing this dotted key—add new slices with kebab-case instead.【F:src/asset-preparation.ts†L40-L41】 |

### Collectibles & Coins

| Atlas key | Description | Consuming module(s) |
| --- | --- | --- |
| `coin-dull-metal`, `coin-dull-bronze`, `coin-shine-silver`, `coin-shine-gold` | Coin art for potential challenge/reward systems. | Reserved; hook them into a new model when implementing collectibles.【F:src/asset-preparation.ts†L26-L31】 |

---

## Stand-alone Images

| File | Notes | Consuming module(s) |
| --- | --- | --- |
| `icon.png` | Loading modal icon and Web App manifest seed. | Injected into the DOM in `src/index.ts` and referenced during build in `webpack.config.js`.【F:src/index.ts†L1-L44】【F:webpack.config.js†L1-L61】 |
| `medal-*.svg` | Vector medals (bronze, silver, gold, platinum). Preloaded manually instead of via the atlas so the scoreboard can scale them crisply. | `src/model/score-board.ts` sets thresholds and preloads each SVG for medal display.【F:src/model/score-board.ts†L1-L125】 |
| `xio-dark-round.png`, `xio-light-round.png` | Project attribution avatars. Keep for marketing/about screens; no runtime reference yet. | Currently unused; document any new usage. |

---

## Audio Clips (`src/assets/audio`)

`asset-preparation.ts` queues all `.ogg` files and registers them with `WebSfx`. `src/model/sfx.ts` wraps playback helpers used across the game loop.

| File | In-game cue | Playback helper |
| --- | --- | --- |
| `die.ogg` | Bird death impact. | `Sfx.die()` triggers on crash logic.【F:src/model/sfx.ts†L1-L27】 |
| `hit.ogg` | Pipe collision hit-stop. | `Sfx.hit()` with optional callback for chaining.【F:src/model/sfx.ts†L24-L32】 |
| `point.ogg` | Score increment chime. | `Sfx.point()` when passing pipes.【F:src/model/sfx.ts†L17-L24】 |
| `swooshing.ogg` | Menu/UI swoosh. | `Sfx.swoosh()` for button toggles and transitions.【F:src/model/sfx.ts†L32-L40】 |
| `wing.ogg` | Flap sound. | `Sfx.wing()` during `Bird.flap()`.【F:src/model/bird.ts†L129-L160】【F:src/model/sfx.ts†L34-L41】 |

---

## Naming Conventions

* **Atlas keys**: Use kebab-case `category-variant[-state]` descriptors (e.g., `pipe-green-top`, `bird-yellow-mid`). Avoid dots in new keys; the lone `number.sm-8` slice is a historical artifact kept only for compatibility.【F:src/asset-preparation.ts†L18-L88】
* **Medals**: SVG filenames follow `medal-<tier>.svg`. Scoreboard tiers map thresholds to these keys via `imageKey` (`medal-platinum`, `medal-gold`, etc.).【F:src/model/score-board.ts†L37-L102】
* **Audio**: File names match the semantic action (`wing`, `die`, `hit`, `point`, `swooshing`). Reuse those identifiers when wiring new sounds through `Sfx` so helpers stay expressive.【F:src/model/sfx.ts†L1-L41】

When introducing new assets, register them in `asset-preparation.ts` (or preload alongside medals/audio when vectors or external media are needed) and document the consumer module here.

---

## Adding New Assets

### Sprite Atlas Updates

1. **Prepare artwork**: Maintain power-of-two friendly dimensions when possible (e.g., existing backgrounds are 288×512) and align sprites to the pixel grid to preserve crispness when `imageSmoothingEnabled` is `false`.【F:src/asset-preparation.ts†L18-L88】【F:src/lib/sprite-destructor/index.ts†L49-L87】
2. **Optimize**: Export PNG-8/PNG-24 without alpha bloat, then run through a lossless optimizer (e.g., `oxipng -o4` or `pngquant --quality=65-95`) before committing.
3. **Update the atlas**: Append the new sprite to `atlas.png`, record its coordinates/dimensions, and add a matching `sd.cutOut('your-key', sx, sy, width, height)` entry in `src/asset-preparation.ts`.
4. **Reference the key**: Retrieve the slice with `SpriteDestructor.asset('your-key')` inside the consuming class. If the asset is part of a configurable list (e.g., pipes, birds), also extend the relevant `SceneGenerator` collections or maps.
5. **Document**: Add a row to the appropriate table above noting the consumer module and intended usage.

### Stand-alone Images (SVG/PNG outside the atlas)

1. Prefer SVG for scalable UI where possible (as done for medals). When using raster images, export at 2× the intended display size to accommodate high-DPI screens.
2. Preload via dedicated helpers (`preloadImage` in `score-board.ts`) or a bespoke loader if scaling is required before display.
3. Store files in `src/assets/` alongside similar media and update this README with usage context.

### Audio

1. Export effects as short, looping-safe `.ogg` or `.mp3` clips normalized around −1 dBFS to avoid clipping when multiple sounds overlap.
2. Add the file path to the `WebSfx` constructor map in `src/asset-preparation.ts` and expose a helper in `src/model/sfx.ts` for consistent playback logic.
3. Test volume interactions with `Sfx.currentVolume` (toggled via the speaker button) to ensure the new sound respects mute and gain changes.【F:src/model/btn-toggle-speaker.ts†L1-L39】【F:src/model/sfx.ts†L11-L41】

---

Keeping this document current ensures every asset has a discoverable owner and helps future contributors follow the established pipeline without introducing mismatched naming or unused slices.
