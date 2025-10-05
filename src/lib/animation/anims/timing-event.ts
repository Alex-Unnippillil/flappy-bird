/**
 * Emits periodic ticks that align with animation timing.
 *
 * Role
 * - Shares the `DefaultProps` lifecycle with other animation classes so HUD counters can be driven
 *   by the same requestAnimationFrame cadence.
 * - Complements sibling fade/movement animations by providing a simple cadence trigger (e.g., to
 *   increment a score display).
 *
 * Inputs & Outputs
 * - Constructor accepts an optional `diff` interval specifying how frequently `value` should return
 *   `true`.
 * - `value` returns a boolean flag indicating whether the interval elapsed since the previous tick.
 *
 * Implementation Notes
 * - Resets `startTime` after each trigger to avoid drift and keeps state local so consumers can
 *   poll without additional bookkeeping.
 */

import DefaultProps from '../abstracts/default-properties';

export interface ITimingEventOptions {
  diff: number; // Interval per number
}

export interface ITimingEventOptionsConstructor extends Partial<ITimingEventOptions> {}

export interface ITimingEventStatus {
  running: boolean;
  complete: boolean;
}

export class TimingEvent extends DefaultProps {
  private options: ITimingEventOptions;

  constructor(options?: ITimingEventOptionsConstructor) {
    super();
    this.options = {
      diff: 100
    };

    Object.assign(this.options, options);
  }

  public get status(): ITimingEventStatus {
    return {
      running: this.isRunning,
      complete: this.isComplete
    };
  }

  public get value(): boolean {
    const td = this.timeDiff;
    if (td >= this.options.diff) {
      this.startTime = this.time;
      return true;
    }

    return false;
  }
}
