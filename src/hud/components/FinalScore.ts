import { formatScore } from "../formatScore";
import "../styles/final-score.css";

export interface FinalScoreUpdateOptions {
  /**
   * When true, the component will show the celebratory badge indicating the
   * player achieved a new personal best.
   */
  isRecord?: boolean;
}

export interface FinalScoreOptions {
  /**
   * Optional heading text displayed at the top of the score summary.
   */
  heading?: string;
}

interface MetricElements {
  container: HTMLDivElement;
  value: HTMLSpanElement;
}

export class FinalScore {
  private readonly root: HTMLElement;
  private readonly scoreValue: HTMLSpanElement;
  private readonly bestValue: HTMLSpanElement;
  private readonly badge: HTMLSpanElement;

  constructor(options: FinalScoreOptions = {}) {
    this.root = document.createElement("section");
    this.root.className = "final-score";
    this.root.hidden = true;
    this.root.setAttribute("role", "status");
    this.root.setAttribute("aria-live", "polite");

    const title = document.createElement("h2");
    title.className = "final-score__title";
    title.textContent = options.heading ?? "Final score";
    this.root.appendChild(title);

    const metrics = document.createElement("div");
    metrics.className = "final-score__metrics";

    const scoreMetric = this.createMetric("Score");
    this.scoreValue = scoreMetric.value;
    metrics.appendChild(scoreMetric.container);

    const bestMetric = this.createMetric("Best");
    this.bestValue = bestMetric.value;
    metrics.appendChild(bestMetric.container);

    this.root.appendChild(metrics);

    this.badge = document.createElement("span");
    this.badge.className = "final-score__badge";
    this.badge.textContent = "New personal best!";
    this.badge.setAttribute("role", "note");
    this.badge.hidden = true;
    this.root.appendChild(this.badge);
  }

  private createMetric(label: string): MetricElements {
    const container = document.createElement("div");
    container.className = "final-score__metric";

    const labelEl = document.createElement("span");
    labelEl.className = "final-score__label";
    labelEl.textContent = label;
    container.appendChild(labelEl);

    const value = document.createElement("span");
    value.className = "final-score__value";
    value.textContent = "0";
    container.appendChild(value);

    return { container, value };
  }

  /**
   * Returns the DOM element representing the component. Useful for unit tests
   * and direct DOM integration.
   */
  get element(): HTMLElement {
    return this.root;
  }

  /**
   * Appends the component to the given container. When a reference node is
   * supplied, the component is inserted before it to preserve overlay layout.
   */
  attach(container: Element, before?: Element | null): void {
    if (before) {
      container.insertBefore(this.root, before);
    } else {
      container.appendChild(this.root);
    }
  }

  setScores(score: number, best: number, options: FinalScoreUpdateOptions = {}): void {
    this.scoreValue.textContent = formatScore(score);
    this.bestValue.textContent = formatScore(best);

    const isRecord = options.isRecord ?? (score > 0 && score >= best);
    this.badge.hidden = !isRecord;
    this.root.classList.toggle("final-score--record", isRecord);
  }

  show(): void {
    this.root.hidden = false;
  }

  hide(): void {
    this.root.hidden = true;
  }
}
