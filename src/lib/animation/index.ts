/**
 * Aggregates the public animation primitives for the game loop.
 *
 * Role
 * - Re-exports the individual animation classes so screens can import from a single module.
 * - Couples concrete animations with their shared abstract bases from `abstracts/` and easing
 *   helpers in this package.
 *
 * Exports
 * - Animation classes that implement various transition effects (`fade-out`, `bounce-in`, etc.)
 *   as well as the `timing-event` helper used to throttle repeated callbacks.
 */
export * from './anims/fade-out';
export * from './anims/fade-out-in';
export * from './anims/flying';
export * from './anims/bounce-in';
export * from './anims/timing-event';
