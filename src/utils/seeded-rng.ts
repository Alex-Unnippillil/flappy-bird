// File Overview: This module belongs to src/utils/seeded-rng.ts.
export type RandomGenerator = () => number;

/**
 * Mulberry32 PRNG implementation that yields deterministic sequences for a given seed.
 * The seed is coerced into an unsigned 32-bit integer to guarantee consistent wrapping behaviour.
 */
export const createSeededRng = (seed: number): RandomGenerator => {
  let state = normalizeSeed(seed);

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Generates a random seed using the strongest available source in the environment.
 */
export const randomSeed = (): number => {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0];
  }

  return normalizeSeed(Math.floor(Math.random() * 0xffffffff));
};

export const normalizeSeed = (seed: number): number => seed >>> 0;
