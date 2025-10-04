/**
 * Shared test setup for Vitest. Extend this file with any global mocks or
 * configuration needed across the test suite.
 */

if (typeof process !== 'undefined' && process.env) {
  process.env.VITE_FF_F02 ??= 'true';
}

export {};
