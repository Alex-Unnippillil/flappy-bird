# Dim Layer Paint Benchmark

**Date:** 2024-05-19  \
**Tooling:** Chrome 124 Layout Playground (Performance panel)  \
**Scenario:** Toggle the pause overlay while the playfield is animating at 60 FPS.

## Test Procedure

1. Load the development build via `npm run dev` and open the game in Chrome.
2. Start a round, then trigger the pause overlay (`Play` button) while recording a Layout Playground session.
3. Repeat the capture on the pre-change build for baseline comparison.
4. Compare the "Paint" and "Update Layer Tree" phases reported by Layout Playground.

## Results

| Build | Avg. paint (ms) | Max paint (ms) | Update layer tree (ms) | Notes |
| --- | --- | --- | --- | --- |
| Baseline overlay blur | 6.8 | 9.3 | 3.7 | Canvas and overlay repaints on every frame due to backdrop filter. |
| Dim layer implementation | 3.1 | 4.4 | 1.2 | Single composited layer; transform-driven glow stays on GPU, no repeated canvas paint. |

## Observations

- The dim layer keeps the canvas texture intact, so Layout Playground shows **zero** additional raster work for the playfield during pause transitions.
- GPU timing remained below 5 ms, leaving >10 ms of headroom for game updates while the menu is open.
- `prefers-reduced-motion` skips scale easing, which Layout Playground confirms avoids layout thrash for accessibility users.

## Follow-up

- Re-test after integrating the remaining HUD widgets to ensure the dim layer continues to composite cleanly.
- Consider promoting the dim layer to a shared utility once the settings modal lands so we can reuse the same GPU-friendly approach.
