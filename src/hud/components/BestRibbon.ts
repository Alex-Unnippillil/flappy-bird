import "../styles/best-ribbon.css";

export type BestRibbonEventType = "tie" | "beat";

export interface BestRibbonEventDetail {
  score: number;
  type: BestRibbonEventType;
}

export const BEST_RIBBON_EVENT = "hud:best-ribbon";

const eventTarget: EventTarget | null =
  typeof window !== "undefined" ? window : null;

export function emitBestRibbonEvent(
  type: BestRibbonEventType,
  score: number
): void {
  if (!eventTarget) return;

  eventTarget.dispatchEvent(
    new CustomEvent<BestRibbonEventDetail>(BEST_RIBBON_EVENT, {
      detail: { type, score },
    })
  );
}

let activeInstance: BestRibbon | null = null;

class BestRibbon {
  private element: HTMLDivElement;

  private valueEl: HTMLSpanElement;

  private statusEl: HTMLSpanElement;

  private hideTimeout: number | null = null;

  constructor() {
    this.element = document.createElement("div");
    this.element.className = "best-ribbon";
    this.element.setAttribute("role", "status");
    this.element.setAttribute("aria-live", "polite");

    const badge = document.createElement("span");
    badge.className = "best-ribbon__badge";
    badge.setAttribute("aria-hidden", "true");
    badge.textContent = "🏅";

    const content = document.createElement("div");
    content.className = "best-ribbon__content";

    const title = document.createElement("span");
    title.className = "best-ribbon__title";
    title.textContent = "Best score";

    this.valueEl = document.createElement("span");
    this.valueEl.className = "best-ribbon__value";
    this.valueEl.textContent = "0";

    this.statusEl = document.createElement("span");
    this.statusEl.className = "best-ribbon__status";

    content.append(title, this.valueEl, this.statusEl);
    this.element.append(badge, content);

    const parent = document.body ?? document.documentElement;
    parent?.appendChild(this.element);

    eventTarget?.addEventListener(
      BEST_RIBBON_EVENT,
      this.handleEvent as EventListener
    );
  }

  private handleEvent = (event: Event) => {
    if (!(event instanceof CustomEvent)) return;
    const detail = event.detail as BestRibbonEventDetail | undefined;
    if (!detail) return;
    this.show(detail);
  };

  private show({ score, type }: BestRibbonEventDetail) {
    this.valueEl.textContent = String(score);
    this.statusEl.textContent =
      type === "beat" ? "New record!" : "Matched the best";
    this.element.dataset.state = type;

    this.element.classList.add("best-ribbon--visible");
    if (this.hideTimeout !== null) {
      window.clearTimeout(this.hideTimeout);
    }
    this.hideTimeout = window.setTimeout(() => this.hide(), 3200);
  }

  private hide() {
    this.element.classList.remove("best-ribbon--visible");
    this.element.removeAttribute("data-state");
    if (this.hideTimeout !== null) {
      window.clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }
}

export function ensureBestRibbon(): BestRibbon | null {
  if (typeof document === "undefined") {
    return null;
  }

  if (!activeInstance) {
    activeInstance = new BestRibbon();
  }

  return activeInstance;
}
