# HUD Performance Notes

The HUD layer renders dynamic text updates at a much higher cadence than the rest of the DOM. To keep these updates cheap:

- **Mount into an isolated root.** Use `mountHudRoot()` from `src/core/hud.ts` to create or reuse the shared `#hud-root` container. The element applies GPU-friendly transforms and `isolation` so frequent writes stay sandboxed.
- **Batch DOM writes.** Prefer updating text nodes or attributes inside a single animation frame. Avoid removing/adding large subtrees when incrementing scores; reuse nodes instead.
- **Respect CSS containment.** `hud.css` pins the HUD to the viewport and applies `contain: layout paint style`, preventing layout invalidation outside the HUD subtree. Keep new HUD widgets inside this root to preserve isolation.
- **Avoid forced reflows.** Do not read layout metrics (e.g., `offsetWidth`) during the same frame you mutate HUD elements. When measurements are required, schedule them in a separate frame or rely on cached values from the game loop.
- **Keep pointer passthrough explicit.** The HUD root blocks pointer events by default. Re-enable them on interactive descendants (buttons, sliders) so overlays do not intercept gameplay input.

Following these guidelines keeps HUD updates deterministic and avoids hitching during rapid score changes.
