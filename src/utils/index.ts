/**
 * Utility barrel that re-exports the helper modules used across the game.
 *
 * Categories exported from this file:
 * - Math helpers: `rescaleDim`, `lerp`, `clamp`, `randomClamp`, `flipRange`
 * - Animation helpers: `framer`, `waves`
 * - DOM helpers: `openInNewTab`
 */

// Math helpers
export * from './rescale-dim';
export * from './linear-interpolation';
export * from './clamp';
export * from './random-clamp';
export * from './flip-range'; // Mirrors a value within the provided range for ping-pong style effects

// Animation helpers
export * from './framer';
export * from './waves'; // Time-based sine/cosine oscillators useful for subtle ambient motion

// DOM helpers
export * from './open-in-new-tab';
