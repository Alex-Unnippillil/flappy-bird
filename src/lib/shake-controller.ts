// File Overview: This module belongs to src/lib/shake-controller.ts.
import MotionPreference, { MotionPreferenceState } from './motion-preference';

export interface ShakeOptions {
  amplitude?: number;
  duration?: number;
  frequency?: number;
}

const DEFAULT_OPTIONS: Required<ShakeOptions> = {
  amplitude: 6,
  duration: 240,
  frequency: 28
};

export default class ShakeController {
  private offset: ICoordinate;
  private options: Required<ShakeOptions>;
  private startTime: number;
  private active: boolean;
  private seedX: number;
  private seedY: number;
  private reduceMotion: boolean;
  private unsubscribe: (() => void) | null;

  constructor() {
    this.offset = { x: 0, y: 0 };
    this.options = { ...DEFAULT_OPTIONS };
    this.startTime = 0;
    this.active = false;
    this.seedX = Math.random() * Math.PI * 2;
    this.seedY = Math.random() * Math.PI * 2;
    this.reduceMotion = MotionPreference.shouldReduceMotion();
    this.unsubscribe = MotionPreference.subscribe(
      (state: MotionPreferenceState) => {
        this.reduceMotion = state.reduceMotion;
        if (state.reduceMotion) {
          this.reset();
        }
      }
    );
  }

  public trigger(options: ShakeOptions = {}): void {
    if (this.reduceMotion) return;

    this.options = {
      amplitude: options.amplitude ?? DEFAULT_OPTIONS.amplitude,
      duration: options.duration ?? DEFAULT_OPTIONS.duration,
      frequency: options.frequency ?? DEFAULT_OPTIONS.frequency
    };

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this.startTime = now;
    this.active = true;
    this.seedX = Math.random() * Math.PI * 2;
    this.seedY = Math.random() * Math.PI * 2;
  }

  public Update(): void {
    if (!this.active) return;

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const elapsed = now - this.startTime;

    if (elapsed >= this.options.duration) {
      this.reset();
      return;
    }

    const progress = elapsed / this.options.duration;
    const damping = Math.pow(1 - progress, 2);
    const angle = (elapsed / 16.67) * (this.options.frequency * 0.35);

    this.offset.x = Math.sin(angle + this.seedX) * this.options.amplitude * damping;
    this.offset.y = Math.cos(angle * 1.25 + this.seedY) * this.options.amplitude * damping;
  }

  public get value(): ICoordinate {
    if (!this.active) {
      return { x: 0, y: 0 };
    }

    return { ...this.offset };
  }

  public reset(): void {
    this.active = false;
    this.offset = { x: 0, y: 0 };
  }

  public dispose(): void {
    this.reset();
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
