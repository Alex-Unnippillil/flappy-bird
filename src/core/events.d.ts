export {};

/**
 * Extend this interface to describe custom game events. Consumers should use
 * declaration merging from any module (for example within a feature) to append
 * additional event names and payload shapes:
 *
 * ```ts
 * declare global {
 *   interface GameEvents {
 *     'feature:score:update': { value: number };
 *   }
 * }
 * ```
 */
declare global {
  interface GameEvents {}
}
