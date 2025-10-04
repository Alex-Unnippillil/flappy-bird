import "../styles/combo-toast.css";

export const HUD_COMBO = "HUD_COMBO" as const;

export interface ComboToastEventDetail {
  streak: number;
  bonus?: number;
  message?: string;
}

export type ComboToastEvent = CustomEvent<ComboToastEventDetail>;

export interface ComboToastOptions {
  host?: HTMLElement;
  durationMs?: number;
  formatMessage?: (detail: ComboToastEventDetail) => string;
}

const DEFAULT_DURATION_MS = 800;

function defaultMessage(detail: ComboToastEventDetail): string {
  if (detail.message && detail.message.trim().length > 0) {
    return detail.message;
  }

  const safeStreak = Number.isFinite(detail.streak)
    ? Math.max(1, Math.round(detail.streak))
    : 1;
  const streakLabel = `x${safeStreak} Combo!`;

  if (detail.bonus && Number.isFinite(detail.bonus) && detail.bonus > 0) {
    const bonusLabel = `+${Math.round(detail.bonus)}`;
    return `${streakLabel} ${bonusLabel}`;
  }

  return streakLabel;
}

export class ComboToast {
  private readonly host: HTMLElement;
  private readonly container: HTMLElement;
  private readonly timers = new Map<HTMLElement, number>();
  private readonly handleComboBound: (event: Event) => void;
  private readonly formatMessage: (detail: ComboToastEventDetail) => string;
  private readonly duration: number;

  constructor(options: ComboToastOptions = {}) {
    if (typeof document === "undefined") {
      throw new Error("ComboToast requires a DOM environment.");
    }

    this.host = options.host ?? document.body;
    this.duration = Math.max(0, options.durationMs ?? DEFAULT_DURATION_MS);
    this.formatMessage = options.formatMessage ?? defaultMessage;

    this.container = document.createElement("div");
    this.container.className = "combo-toast-layer";
    this.container.setAttribute("aria-live", "polite");
    this.container.setAttribute("aria-atomic", "false");
    this.host.appendChild(this.container);

    this.handleComboBound = (event: Event) => {
      this.handleCombo(event as ComboToastEvent);
    };

    window.addEventListener(
      HUD_COMBO,
      this.handleComboBound as EventListener,
      { passive: true }
    );
  }

  private handleCombo(event: ComboToastEvent) {
    const detail = event.detail;
    if (!detail || !Number.isFinite(detail.streak)) {
      return;
    }

    const toast = document.createElement("div");
    toast.className = "combo-toast";
    toast.textContent = this.formatMessage(detail);
    toast.setAttribute("role", "status");
    this.container.appendChild(toast);
    this.container.classList.add("has-active-toast");

    const cleanup = () => {
      this.teardownToast(toast);
    };

    toast.addEventListener("animationend", cleanup, { once: true });

    const fallbackId = window.setTimeout(cleanup, this.duration + 50);
    this.timers.set(toast, fallbackId);
  }

  private teardownToast(toast: HTMLElement) {
    const timerId = this.timers.get(toast);
    if (typeof timerId === "number") {
      window.clearTimeout(timerId);
      this.timers.delete(toast);
    }

    toast.remove();

    if (!this.container.childElementCount) {
      this.container.classList.remove("has-active-toast");
    }
  }

  destroy() {
    window.removeEventListener(
      HUD_COMBO,
      this.handleComboBound as EventListener
    );

    this.timers.forEach((timeoutId, toast) => {
      window.clearTimeout(timeoutId);
      if (toast.isConnected) {
        toast.remove();
      }
    });
    this.timers.clear();

    if (this.container.isConnected) {
      this.container.remove();
    }
  }
}
