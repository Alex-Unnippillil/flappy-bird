import '../styles/score-pop.css';

export const SCORE_EVENT = 'hud:score';
export const SCORE_POP_CLASS = 'is-score-pop';
const DEFAULT_THROTTLE_MS = 180;
const DEFAULT_POP_DURATION_MS = 220;

export interface ScoreEventDetail {
  value: number;
}

export type ScoreEvent = CustomEvent<ScoreEventDetail>;

export interface ScoreOptions {
  element: HTMLElement;
  eventTarget?: EventTarget;
  eventName?: string;
  throttleMs?: number;
  popDurationMs?: number;
  popClassName?: string;
  formatValue?: (value: number) => string;
}

export interface ScoreSetOptions {
  animate?: boolean;
  force?: boolean;
}

export function createScoreEvent(value: number): ScoreEvent {
  return new CustomEvent<ScoreEventDetail>(SCORE_EVENT, {
    detail: { value },
  });
}

export function dispatchScoreEvent(target: EventTarget, value: number): boolean {
  return target.dispatchEvent(createScoreEvent(value));
}

export class Score {
  private readonly element: HTMLElement;

  private readonly eventTarget: EventTarget;

  private readonly eventName: string;

  private readonly popClassName: string;

  private readonly throttleMs: number;

  private readonly popDurationMs: number;

  private readonly formatValue: (value: number) => string;

  private currentValue: number | null = null;

  private pendingPops = 0;

  private processingQueue = false;

  private throttleTimer: number | null = null;

  private removalTimer: number | null = null;

  constructor(options: ScoreOptions) {
    if (!options?.element) {
      throw new Error('Score HUD requires an element to control');
    }

    this.element = options.element;
    this.eventTarget = options.eventTarget ?? options.element;
    this.eventName = options.eventName ?? SCORE_EVENT;
    this.popClassName = options.popClassName ?? SCORE_POP_CLASS;
    this.throttleMs = Math.max(0, options.throttleMs ?? DEFAULT_THROTTLE_MS);
    this.popDurationMs = Math.max(0, options.popDurationMs ?? DEFAULT_POP_DURATION_MS);
    this.formatValue = options.formatValue ?? ((value: number) => String(value));

    this.eventTarget.addEventListener(this.eventName, this.handleScoreEvent as EventListener);
  }

  public dispose(): void {
    this.eventTarget.removeEventListener(
      this.eventName,
      this.handleScoreEvent as EventListener
    );
    if (this.throttleTimer !== null) {
      clearTimeout(this.throttleTimer);
      this.throttleTimer = null;
    }
    if (this.removalTimer !== null) {
      clearTimeout(this.removalTimer);
      this.removalTimer = null;
    }
    this.pendingPops = 0;
    this.processingQueue = false;
  }

  public setValue(value: number, options: ScoreSetOptions = {}): void {
    const animate = options.animate ?? true;
    const force = options.force ?? false;
    this.updateDisplay(value, { animate, force });
  }

  private handleScoreEvent = (event: Event): void => {
    if (!(event instanceof CustomEvent)) {
      return;
    }

    const detail = event.detail as Partial<ScoreEventDetail> | null;
    const value = detail?.value;
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return;
    }

    this.updateDisplay(value, { animate: true, force: false });
  };

  private updateDisplay(
    value: number,
    options: { animate: boolean; force: boolean }
  ): void {
    const { animate, force } = options;
    const previous = this.currentValue;
    this.currentValue = value;
    this.element.textContent = this.formatValue(value);

    if (!animate) {
      return;
    }

    if (force || previous === null || value > previous) {
      this.enqueuePop();
    }
  }

  private enqueuePop(): void {
    this.pendingPops += 1;
    if (!this.processingQueue) {
      this.processingQueue = true;
      this.processQueue();
    }
  }

  private processQueue(): void {
    if (this.pendingPops === 0) {
      this.processingQueue = false;
      return;
    }

    this.pendingPops -= 1;
    this.triggerPop();

    if (this.throttleMs === 0) {
      this.processQueue();
      return;
    }

    this.throttleTimer = window.setTimeout(() => {
      this.throttleTimer = null;
      this.processQueue();
    }, this.throttleMs);
  }

  private triggerPop(): void {
    if (this.removalTimer !== null) {
      clearTimeout(this.removalTimer);
      this.removalTimer = null;
    }

    this.element.classList.remove(this.popClassName);
    // Force layout so the browser registers the class re-addition.
    void this.element.offsetWidth;
    this.element.classList.add(this.popClassName);

    if (this.popDurationMs > 0) {
      this.removalTimer = window.setTimeout(() => {
        this.element.classList.remove(this.popClassName);
        this.removalTimer = null;
      }, this.popDurationMs);
    }
  }
}
