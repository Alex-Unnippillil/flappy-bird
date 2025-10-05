/**
 * Drives sprite movement between two coordinates with easing.
 *
 * Role
 * - Extends the shared `Flying` abstract so movement animations respect the same timing settings
 *   as other modules within `animation/`.
 *
 * Inputs & Outputs
 * - Consumes the `from`/`to` coordinates defined on the base class and returns the interpolated
 *   position via the `value` getter.
 *
 * Implementation Notes
 * - Uses the `lerp` utility with the easing curve selected by `Flying` to avoid manual math for
 *   each axis and ensures the final frame snaps exactly to the destination.
 */
import IFlying from '../abstracts/flying';
import { lerp } from '../../../utils';

export class Fly extends IFlying {
  public get value(): ICoordinate {
    if (!this.isRunning) {
      return this.isComplete ? this.options.to : this.options.from;
    }

    const f = this.options.from;
    const t = this.options.to;
    const diff = this.timeDiff / this.options.duration;

    if (diff >= 1) {
      this.stop();

      // Prevent bounce effect
      return this.options.to;
    }

    return {
      x: lerp(f.x, t.x, this.inUseTransition(diff)),
      y: lerp(f.y, t.y, this.inUseTransition(diff))
    };
  }
}
