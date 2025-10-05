/**
 * Produces a "bounce in" entrance animation that combines a vertical hop with a fade.
 *
 * Role
 * - Extends `DefaultProps` to reuse lifecycle tracking shared across animation siblings.
 * - Couples easing curves from `easing.ts` so both the opacity and bounce height follow the
 *   configured durations.
 *
 * Inputs & Outputs
 * - Constructor accepts optional duration overrides for the fade and bounce phases via
 *   `IBounceInConstructor`.
 * - `value` exposes the current opacity and positional offset, allowing screens to drive CSS
 *   styles or canvas transforms.
 *
 * Implementation Notes
 * - Uses the sine-wave easing helper so the bounce peaks halfway through the duration while the
 *   fade relies on the swing curve, mirroring other fade animations in this folder.
 */
import DefaultProps from '../abstracts/default-properties';
import * as easing from '../easing';

export interface IBounceIn {
  durations: {
    fading: number;
    bounce: number;
  };
}

export interface IBounceInConstructor extends Partial<IBounceIn> {}

export interface IBounceInStatus {
  running: boolean;
  complete: boolean;
}

export interface IBounceInValue {
  opacity: number;
  value: number;
}

export class BounceIn extends DefaultProps {
  private options: IBounceIn;

  constructor(options?: IBounceInConstructor) {
    super();

    this.options = {
      durations: {
        fading: 400,
        bounce: 1000
      }
    };

    Object.assign(this.options, options);
  }

  public get status(): IBounceInStatus {
    return {
      running: this.isRunning,
      complete: this.isComplete
    };
  }

  get value(): IBounceInValue {
    if (!this.isRunning) {
      return {
        opacity: this.isComplete ? 1 : 0,
        value: 0
      };
    }

    const { fading, bounce } = this.options.durations;
    const timeDiff = this.timeDiff;

    let opacity: number = easing.swing(timeDiff / fading);
    let value: number = -easing.sineWaveHS(timeDiff / bounce);

    if (timeDiff >= Math.max(fading, bounce)) {
      this.stop();
      return {
        opacity: 1,
        value: 0
      };
    }

    if (timeDiff >= fading) {
      opacity = 1;
    }

    if (timeDiff >= bounce) {
      value = 0;
    }

    return { opacity, value };
  }
}
