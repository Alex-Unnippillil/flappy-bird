import "./styles/score-contrast.css";

type ScoreValue = number | string;

type ResolvableElement = string | HTMLElement | null | undefined;

export class Score {
  private readonly element: HTMLElement | null;

  constructor(target: ResolvableElement) {
    this.element = Score.resolve(target);
    this.element?.classList.add("hud-score-contrast");
  }

  set(value: ScoreValue): void {
    if (!this.element) return;
    this.element.textContent = typeof value === "number" ? value.toString() : value;
  }

  get node(): HTMLElement | null {
    return this.element;
  }

  private static resolve(target: ResolvableElement): HTMLElement | null {
    if (!target) {
      return null;
    }

    if (typeof target === "string") {
      return document.querySelector<HTMLElement>(target);
    }

    return target;
  }
}
