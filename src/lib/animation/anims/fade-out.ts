/**
 * Implements a one-way fade-to-transparent animation.
 *
 * Role
 * - Builds on the shared `Fading` base to reuse easing selection and duration management alongside
 *   sibling fade animations.
 *
 * Inputs & Outputs
 * - Consumes the duration configured on the parent class and exposes the current opacity through
 *   the `value` getter, returning `0` once the animation completes.
 *
 * Implementation Notes
 * - Uses the `flipRange` utility so the chosen easing curve can be applied in reverse without
 *   reimplementing easing functions.
 */
import AbsFading from '../abstracts/fading';
import { flipRange } from '../../../utils';

export class FadeOut extends AbsFading {
  public get value(): number {
    if (this.isComplete || !this.isRunning) return 0;

    const value = this.timeDiff / this.options.duration;

    if (value >= 1) {
      this.stop();
      return 0;
    }

    return this.inUseTransition(flipRange(0, 1, value));
  }
}
