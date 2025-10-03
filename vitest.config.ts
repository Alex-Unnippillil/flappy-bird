import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': srcDir,
      src: srcDir,
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: [fileURLToPath(new URL('./src/setupTests.ts', import.meta.url))],
    coverage: {
      enabled: true,
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'html', 'lcov'],
    },
  },
});
