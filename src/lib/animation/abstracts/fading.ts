/**
 * Base class for opacity-based transitions.
 *
 * Role
 * - Extends `DefaultProperties` with easing-aware fade helpers used by `FadeOut` and
 *   `FadeOutIn`.
 * - Stores configurable duration and easing curve so sibling animations can share timing rules.
 *
 * Inputs & Outputs
 * - Constructor optionally accepts a partial `IFadingOptions` to tweak duration or easing.
 * - Subclasses access `inUseTransition()` to convert raw progress values into eased opacity.
 *
 * Implementation Notes
 * - Delegates easing selection to `animation/easing.ts` via the `IEasingKey` enumeration, keeping
 *   easing math centralized.
 */
import DefaultProps from './default-properties';
import { IEasingKey } from '../easing';
import * as easing from '../easing';

export interface IFadingOptions {
  duration: number;
  transition: IEasingKey;
}

export interface IConstructorFadingOptions extends Partial<IFadingOptions> {}

export interface IFadingStatus {
  running: boolean;
  complete: boolean;
}

export default abstract class Fading extends DefaultProps {
  protected options: IFadingOptions;

  constructor(options?: IConstructorFadingOptions) {
    super();
    this.options = {
      duration: 500, // ms
      transition: 'swing'
    };

    Object.assign(this.options, options ?? {});
  }

  public get status(): IFadingStatus {
    return {
      running: this.isRunning,
      complete: this.isComplete
    };
  }

  protected inUseTransition(num: number): number {
    return easing[this.options.transition](num);
  }

  public abstract get value(): number;
}
