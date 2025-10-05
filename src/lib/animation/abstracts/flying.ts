/**
 * Base class for position interpolation animations.
 *
 * Role
 * - Provides vector-based lerp helpers for moving sprites between coordinates.
 * - Shared by the concrete `Fly` animation so movement uses the same timing/easing configuration
 *   as other animation modules.
 *
 * Inputs & Outputs
 * - Constructor accepts starting/ending coordinates plus optional duration/easing overrides.
 * - Subclasses read `inUseTransition()` and the stored coordinate options to compute frames.
 *
 * Implementation Notes
 * - Extends `DefaultProperties` for lifecycle management and uses easing functions from
 *   `animation/easing.ts` to translate elapsed time into normalized interpolation weights.
 */
import IDefaultProperties from './default-properties';
import { IEasingKey } from '../easing';
import * as easing from '../easing';

export interface IFlyingOption {
  duration: number;
  transition: IEasingKey;
  from: ICoordinate;
  to: ICoordinate;
}

export interface IFlyingContructorOption
  extends Omit<IFlyingOption, 'transition' | 'duration'> {
  duration?: number;
  transition?: IEasingKey;
}

export interface IFlyingStatus {
  running: boolean;
  complete: boolean;
}

export default abstract class Flying extends IDefaultProperties {
  protected options: IFlyingOption;

  constructor(options: IFlyingContructorOption) {
    super();
    this.options = {
      duration: 500,
      from: {
        x: 0,
        y: 0
      },
      to: {
        x: 0,
        y: 0
      },
      transition: 'cubicBezier'
    };

    Object.assign(this.options, options);
  }

  public get status(): IFlyingStatus {
    return {
      running: this.isRunning,
      complete: this.isComplete
    };
  }

  protected inUseTransition(num: number): number {
    return easing[this.options.transition](num);
  }

  public abstract get value(): ICoordinate;
}
