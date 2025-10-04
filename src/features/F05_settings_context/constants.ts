export interface BirdRigidbodyDefaults {
  /**
   * Downward acceleration applied to the bird each simulation step. The value
   * is expressed in units per 60Hz frame to mirror the legacy implementation.
   */
  gravity: number;
  /**
   * Maximum downward velocity permitted for the bird. Caps runaway speeds when
   * large frame deltas occur.
   */
  terminalVelocity: number;
  /**
   * Upward impulse applied when a flap occurs. Kept for parity with the legacy
   * bird controller even though F08 currently focuses on passive integration.
   */
  flapImpulse: number;
  /**
   * Starting vertical position for a fresh round. Stored so integrators can
   * reset deterministically without depending on ambient game state.
   */
  initialPosition: number;
  /**
   * Initial velocity (units per frame) for a fresh round.
   */
  initialVelocity: number;
}

export const F05_BIRD_RIGIDBODY_DEFAULTS: Readonly<BirdRigidbodyDefaults> =
  Object.freeze({
    gravity: 0.55,
    terminalVelocity: 13,
    flapImpulse: 9.5,
    initialPosition: 0,
    initialVelocity: 0,
  });

export default F05_BIRD_RIGIDBODY_DEFAULTS;
