/**
 * Alternates between fading a sprite out and then back in using a single animation cycle.
 *
 * Role
 * - Inherits the easing/duration configuration from the shared `Fading` abstract so it stays in
 *   sync with other fade-based effects.
 *
 * Inputs & Outputs
 * - Uses the configured duration twice (once for each direction) and exposes the interpolated
 *   opacity via the `value` getter, clamping to `1` when idle.
 *
 * Implementation Notes
 * - Relies on the stored `startTime` from `DefaultProperties` to determine where the animation is
 *   within its out/in cycle before calling `inUseTransition`.
 */
import Fading from '../abstracts/fading';

export class FadeOutIn extends Fading {
  public get value(): number {
    if (this.isComplete && !this.isRunning) return 1;

    const stime = this.startTime;
    const value = (this.time - stime) / this.options.duration;

    if (value >= 2) this.stop();

    return this.inUseTransition(1 - value);
  }
}
