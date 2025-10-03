import "../styles/best-score.css";

export interface BestScoreOptions {
  /**
   * Target element that will host the component. When omitted, a fresh
   * container element will be created.
   */
  element?: HTMLElement | string | null;
  /**
   * Accessible document reference. Defaults to the global document which is
   * available in the browser and within the jsdom test environment.
   */
  document?: Document;
  /**
   * Custom label shown before the score value. Defaults to "Best".
   */
  label?: string;
  /**
   * Placeholder shown while no best score is available.
   */
  placeholder?: string;
  /**
   * Seed value for the best score, typically restored from persisted state.
   */
  initialBest?: number | null;
  /**
   * Optional formatter for score values.
   */
  formatValue?: (value: number) => string;
}

/**
 * Normalizes numbers coming from game state or storage. The HUD only presents
 * non-negative integers and gracefully falls back to `null` when the input is
 * not finite.
 */
function normalizeScore(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  const clamped = Math.max(0, value);
  return Math.round(clamped);
}

function resolveElement(
  element: HTMLElement | string | null | undefined,
  doc: Document
): HTMLElement {
  if (!element) {
    return doc.createElement("div");
  }

  if (typeof element === "string") {
    const target = doc.querySelector<HTMLElement>(element);
    if (!target) {
      throw new Error(`BestScore: element selector \"${element}\" did not match any nodes`);
    }
    return target;
  }

  return element;
}

const DEFAULT_LABEL = "Best";
const DEFAULT_PLACEHOLDER = "—";

/**
 * Displays the best score achieved in the current session and the delta versus
 * the previous record when available (for example: "Best 42 (+3)").
 */
export class BestScore {
  readonly element: HTMLElement;

  private readonly valueEl: HTMLElement;
  private readonly deltaEl: HTMLElement;
  private readonly labelEl: HTMLElement;
  private readonly placeholder: string;
  private readonly formatValue: (value: number) => string;
  private lastBest: number | null;

  constructor(options: BestScoreOptions = {}) {
    const doc = options.document ?? globalThis.document;
    if (!doc) {
      throw new Error("BestScore: a document instance is required");
    }

    this.element = resolveElement(options.element, doc);
    this.element.classList.add("best-score");
    this.element.setAttribute("role", "group");
    this.element.setAttribute("aria-live", "polite");

    this.placeholder = options.placeholder ?? DEFAULT_PLACEHOLDER;
    this.formatValue = options.formatValue ?? ((value) => String(value));
    this.lastBest = normalizeScore(options.initialBest ?? null);

    this.labelEl = doc.createElement("span");
    this.labelEl.className = "best-score__label";
    this.labelEl.textContent = options.label ?? DEFAULT_LABEL;

    this.valueEl = doc.createElement("span");
    this.valueEl.className = "best-score__value";

    this.deltaEl = doc.createElement("span");
    this.deltaEl.className = "best-score__delta";
    this.deltaEl.setAttribute("aria-hidden", "true");

    this.element.replaceChildren(
      this.labelEl,
      doc.createTextNode(" "),
      this.valueEl,
      this.deltaEl
    );

    this.render(this.lastBest, null);
  }

  /**
   * Updates the component with a new best score value.
   */
  update(nextBest: number | null | undefined): void {
    const normalized = normalizeScore(nextBest);

    if (normalized === null) {
      this.lastBest = null;
      this.render(null, null);
      return;
    }

    const previous = this.lastBest;
    const delta = previous !== null && normalized > previous ? normalized - previous : null;

    this.render(normalized, delta);
    this.lastBest = normalized;
  }

  private render(best: number | null, delta: number | null): void {
    if (best === null) {
      this.valueEl.textContent = this.placeholder;
    } else {
      this.valueEl.textContent = this.formatValue(best);
    }

    if (delta !== null && delta > 0) {
      this.deltaEl.textContent = ` (+${this.formatValue(delta)})`;
      this.deltaEl.removeAttribute("hidden");
    } else {
      this.deltaEl.textContent = "";
      this.deltaEl.setAttribute("hidden", "true");
    }
  }
}
