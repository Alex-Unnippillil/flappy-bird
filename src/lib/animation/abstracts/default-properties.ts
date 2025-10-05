/**
 * Shared timeline state for all animation classes.
 *
 * Role
 * - Tracks start timestamps and running/completion flags that concrete animation subclasses use
 *   to compute progress.
 * - Serves as the base for `Fading`, `Flying`, and `TimingEvent` so sibling classes operate on a
 *   consistent notion of elapsed time (`timeDiff`).
 *
 * Inputs & Outputs
 * - Provides `start()`, `stop()`, and `reset()` lifecycle hooks for subclasses.
 * - Exposes `timeDiff` for measuring the milliseconds since `start()` was invoked.
 *
 * Implementation Notes
 * - Relies on `performance.now()` to avoid `Date` precision issues inside requestAnimationFrame
 *   loops.
 */
export default abstract class DefaultProperties {
  protected isRunning: boolean;
  protected isComplete: boolean;
  protected startTime: number;

  constructor() {
    this.isComplete = false;
    this.isRunning = false;
    this.startTime = 0;
  }

  protected get time(): number {
    return performance.now();
  }

  protected get timeDiff(): number {
    if (!this.isRunning) return 0;
    return this.time - this.startTime;
  }

  public stop(): void {
    this.isComplete = true;
    this.isRunning = false;
  }

  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isComplete = false;
    this.startTime = this.time;
  }

  public reset(): void {
    this.isComplete = false;
    this.isRunning = false;
  }
}
