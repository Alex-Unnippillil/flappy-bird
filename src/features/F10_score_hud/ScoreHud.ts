export const PIPE_CLEARED_EVENT = "feature:F09/pipe:cleared" as const;
export const GAME_STATE_CHANGE_EVENT = "game:state-change" as const;

type PipeClearedDetail = {
  /**
   * Absolute score to display. Optional; falls back to incrementing by one.
   */
  score?: number;
  /**
   * Increment delta for this clear.
   */
  value?: number;
  /**
   * Alternate field name for deltas.
   */
  increment?: number;
};

type GameStateChangeDetail = {
  state?: string;
};

type ScoreHudOptions = {
  container: HTMLElement;
  eventTarget?: EventTarget;
};

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return parsed;
  }
  return null;
}

export class ScoreHud {
  readonly element: HTMLDivElement;
  private score = 0;
  private readonly eventTarget: EventTarget;
  private listeners: Array<() => void> = [];

  constructor({ container, eventTarget }: ScoreHudOptions) {
    this.eventTarget = eventTarget ?? window;

    this.element = document.createElement("div");
    this.element.className = "f10-score-hud";
    this.element.setAttribute("role", "status");
    this.element.setAttribute("aria-live", "polite");
    this.element.setAttribute("aria-atomic", "true");

    container.appendChild(this.element);

    this.updateDisplay(0);
    this.bindEvents();
  }

  private bindEvents() {
    const handlePipeCleared = (event: Event) => {
      if (event instanceof CustomEvent) {
        const detail = (event.detail ?? {}) as PipeClearedDetail;
        const absolute = toNumber(detail.score);
        if (absolute !== null) {
          this.updateDisplay(Math.max(0, Math.floor(absolute)));
          return;
        }

        const increment =
          toNumber(detail.value) ?? toNumber(detail.increment) ?? 1;
        this.increment(Math.max(0, Math.floor(increment)) || 1);
        return;
      }

      this.increment(1);
    };

    const handleGameStateChange = (event: Event) => {
      if (!(event instanceof CustomEvent)) {
        return;
      }
      const detail = (event.detail ?? {}) as GameStateChangeDetail;
      if (detail.state === "ready") {
        this.reset();
      }
    };

    this.eventTarget.addEventListener(
      PIPE_CLEARED_EVENT,
      handlePipeCleared as EventListener,
    );
    this.listeners.push(() =>
      this.eventTarget.removeEventListener(
        PIPE_CLEARED_EVENT,
        handlePipeCleared as EventListener,
      ),
    );

    this.eventTarget.addEventListener(
      GAME_STATE_CHANGE_EVENT,
      handleGameStateChange as EventListener,
    );
    this.listeners.push(() =>
      this.eventTarget.removeEventListener(
        GAME_STATE_CHANGE_EVENT,
        handleGameStateChange as EventListener,
      ),
    );
  }

  private updateDisplay(nextScore: number) {
    this.score = Math.max(0, Math.floor(nextScore));
    const content = String(this.score);
    this.element.textContent = content;
    this.element.dataset.score = content;
  }

  private increment(delta: number) {
    if (!Number.isFinite(delta) || delta <= 0) {
      delta = 1;
    }
    this.updateDisplay(this.score + Math.floor(delta));
  }

  reset() {
    this.updateDisplay(0);
  }

  destroy() {
    this.listeners.forEach((dispose) => {
      try {
        dispose();
      } catch (error) {
        console.error("Failed to dispose ScoreHud listener", error);
      }
    });
    this.listeners = [];
    this.element.remove();
  }
}

export default ScoreHud;
