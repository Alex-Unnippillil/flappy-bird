// File Overview: This module belongs to src/utils/linear-interpolation.ts.
export const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};
