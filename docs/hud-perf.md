# HUD Performance Notes

The HUD (scoreboard, speed meter, and overlay) renders on top of the gameplay canvas and updates every frame. Lightweight layout and paint scopes help prevent HUD updates from triggering expensive reflows inside the rest of the page.

## Current CSS hints

- `.hud-panel` now opts into `contain: layout paint;` so score updates stay isolated from the surrounding layout grid.
- `.speed-meter__fill` promotes to its own compositor layer via `transform: translateZ(0);` and declares `will-change: width;` to smooth rapid progress updates.
- `.game-overlay` adds `contain: layout paint;` and `will-change: opacity;` to keep fade transitions inexpensive when showing or hiding the overlay.
- `.game-button` declares `will-change: transform;` so hover/focus transforms can reuse the same compositor layer.

## Implementation guidelines

- Prefer `contain: layout paint;` (or stricter scopes) for HUD wrappers that update frequently but do not need to influence the page outside their bounds.
- Reserve `will-change` for properties that change during gameplay (score, overlay opacity, progress indicators). Remove the hint if the animation or transition is removed to avoid holding unnecessary layers.
- When animating width/opacity on HUD elements, pair the change with a no-op transform (e.g., `translateZ(0)`) if you observe jank. This can be toggled per-element instead of globally enabling GPU compositing.
- Verify changes in DevTools’ Rendering and Performance panels: ensure frequent HUD updates no longer invalidate layout for the entire document and that compositor layers stay bounded to the HUD components.

## Future considerations

- If we add HUD popovers or tooltips, wrap them in containers with `contain: layout style;` and delay expensive shadow/blur effects until they are visible.
- Measure the HUD with the Performance profiler before adding new CSS filters or heavy box-shadows; trim or wrap them in separate layers if they appear as hotspots.
