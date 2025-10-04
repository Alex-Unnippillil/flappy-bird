# HUD Medal Icons

These SVGs provide four lightweight medal badges (bronze, silver, gold, platinum) optimized for the heads-up display.

## Usage

The icons live under `public/assets/hud-medals/`, so Vite copies them verbatim to the production `dist` bundle. Reference them with the public base path, for example:

```ts
import medalSrc from '/assets/hud-medals/gold.svg';

medalImageElement.src = medalSrc;
```

Each file includes an SPDX license header declaring the artwork is released under the Creative Commons Attribution 4.0 International license (CC-BY-4.0). Preserve the header if you modify or redistribute the icons.
