export const HUD_DANGER_EVENT = "HUD_DANGER" as const;

export type DangerLevel = "none" | "low" | "medium" | "high" | "critical";

export interface DangerEventDetail {
  level: DangerLevel | number;
}

export interface DangerBlinkOptions {
  eventTarget?: EventTarget;
  initialLevel?: DangerLevel;
}

const DEFAULT_LEVEL: DangerLevel = "none";

export const DANGER_LEVEL_CLASSES = {
  none: "danger-blink--none",
  low: "danger-blink--low",
  medium: "danger-blink--medium",
  high: "danger-blink--high",
  critical: "danger-blink--critical",
} as const satisfies Record<DangerLevel, string>;

export const DANGER_LEVEL_INTENSITY = {
  none: 0,
  low: 0.3,
  medium: 0.55,
  high: 0.75,
  critical: 1,
} as const satisfies Record<DangerLevel, number>;

const LEVELS = new Set<DangerLevel>(["none", "low", "medium", "high", "critical"]);

let fallbackEventTarget: EventTarget | null = null;

function getDefaultEventTarget(): EventTarget {
  if (
    typeof window !== "undefined" &&
    window &&
    typeof window.addEventListener === "function"
  ) {
    return window;
  }

  if (!fallbackEventTarget) {
    fallbackEventTarget = new EventTarget();
  }

  return fallbackEventTarget;
}

function isDangerLevel(value: unknown): value is DangerLevel {
  return typeof value === "string" && LEVELS.has(value as DangerLevel);
}

function normaliseLevel(value: unknown): DangerLevel | null {
  if (isDangerLevel(value)) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    if (value <= 0) return "none";
    if (value < 2) return "low";
    if (value < 3) return "medium";
    if (value < 4) return "high";
    return "critical";
  }

  return null;
}

export class DangerBlink {
  private readonly element: HTMLElement;

  private readonly eventTarget: EventTarget;

  private readonly handleDangerBound: (event: Event) => void;

  private currentLevel: DangerLevel = DEFAULT_LEVEL;

  private readonly levelClasses: string[];

  constructor(element: HTMLElement, options: DangerBlinkOptions = {}) {
    if (!element) {
      throw new Error("DangerBlink requires a target element");
    }

    this.element = element;
    this.element.classList.add("danger-blink");
    this.levelClasses = Object.values(DANGER_LEVEL_CLASSES);

    this.eventTarget = options.eventTarget ?? getDefaultEventTarget();
    this.handleDangerBound = this.handleDanger.bind(this);

    this.eventTarget.addEventListener(HUD_DANGER_EVENT, this.handleDangerBound);

    this.applyLevel(options.initialLevel ?? DEFAULT_LEVEL, true);
  }

  get level(): DangerLevel {
    return this.currentLevel;
  }

  public setLevel(level: DangerLevel): void {
    if (!isDangerLevel(level)) {
      throw new Error(`Unsupported danger level: ${String(level)}`);
    }

    this.applyLevel(level);
  }

  public destroy(): void {
    this.eventTarget.removeEventListener(
      HUD_DANGER_EVENT,
      this.handleDangerBound
    );
  }

  private handleDanger(event: Event): void {
    if (!(event instanceof CustomEvent)) {
      return;
    }

    const detail = event.detail as Partial<DangerEventDetail> | null;
    if (!detail) {
      return;
    }

    const level = normaliseLevel(detail.level);
    if (!level) {
      return;
    }

    this.applyLevel(level);
  }

  private applyLevel(level: DangerLevel, force = false): void {
    if (!force && level === this.currentLevel) {
      return;
    }

    for (const className of this.levelClasses) {
      this.element.classList.remove(className);
    }

    const levelClass = DANGER_LEVEL_CLASSES[level];
    if (levelClass) {
      this.element.classList.add(levelClass);
    }

    this.element.style.setProperty(
      "--danger-blink-intensity",
      DANGER_LEVEL_INTENSITY[level].toString()
    );

    this.currentLevel = level;
  }
}
