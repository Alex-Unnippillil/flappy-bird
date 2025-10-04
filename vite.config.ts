import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/flappy-bird/', // Ensure this matches the repository name when deploying to GitHub Pages.
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        birdPreview: resolve(__dirname, 'bird-preview.html'),
        hudLayout: resolve(__dirname, 'playgrounds/hud-layout.html'),
      },
    },
  },
});
