// File Overview: This module belongs to src/utils/random-clamp.ts.
/**
 * A clamping function that accepts two parameters (min, max) and
 * returns a random number in between.
 *
 * @param min Minimum Number
 * @param max Max Number
 * @returns Random Number between min and max
 */

import type { RandomGenerator } from './seeded-rng';

export const randomClamp = (
  min: number,
  max: number,
  rng: RandomGenerator = Math.random
): number => {
  return Math.floor(rng() * (max - min)) + min;
};
