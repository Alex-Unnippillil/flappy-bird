import { HUD_GAME_OVER, HUD_PAUSE, HudPauseEvent, HudPauseEventDetail } from "../events";
import "../styles/pause-badge.css";

type ElementOrSelector = string | HTMLElement | null | undefined;

export interface PauseBadgeOptions {
  /**
   * Event target to listen to for HUD events. Defaults to {@link window}.
   */
  target?: EventTarget | null;
  /**
   * Optional container that the badge should be appended to when it needs to
   * create its own element.
   */
  container?: ElementOrSelector;
  /**
   * Optional element or selector that represents an existing badge element.
   */
  element?: ElementOrSelector;
  /**
   * Text to render inside the badge. Defaults to "Paused".
   */
  label?: string;
}

function resolveElement(source: ElementOrSelector): HTMLElement | null {
  if (!source) {
    return null;
  }

  if (typeof source === "string") {
    return document.querySelector<HTMLElement>(source);
  }

  return source;
}

function createBadge(label: string): HTMLElement {
  const badge = document.createElement("span");
  badge.className = "hud-pause-badge is-hidden";
  badge.textContent = label;
  badge.setAttribute("role", "status");
  badge.setAttribute("aria-live", "polite");
  badge.setAttribute("aria-hidden", "true");
  return badge;
}

function addTargetListener(
  target: EventTarget | null | undefined,
  type: string,
  listener: EventListenerOrEventListenerObject
): () => void {
  if (!target) {
    return () => {};
  }

  target.addEventListener(type, listener);
  return () => target.removeEventListener(type, listener);
}

function normaliseState(detail: HudPauseEventDetail | undefined): {
  paused: boolean;
  gameOver: boolean;
  hasGameOver: boolean;
} {
  if (!detail) {
    return { paused: false, gameOver: false, hasGameOver: false };
  }

  const paused = Boolean(detail.paused);

  let hasGameOver = typeof detail.gameOver === "boolean";
  let gameOver = hasGameOver ? Boolean(detail.gameOver) : false;

  const state = typeof detail.state === "string" ? detail.state.toLowerCase() : "";
  if (state) {
    if (state === "game-over" || state === "game_over" || state === "gameover") {
      gameOver = true;
      hasGameOver = true;
    } else if (state === "running" || state === "playing" || state === "resume") {
      gameOver = false;
      hasGameOver = true;
    }
  }

  return { paused, gameOver, hasGameOver };
}

function isHudPauseEvent(event: Event): event is HudPauseEvent {
  return "detail" in event;
}

export class PauseBadge {
  public readonly element: HTMLElement;

  private readonly target: EventTarget | null;
  private readonly removeListeners: Array<() => void> = [];

  private isPaused = false;
  private isGameOver = false;

  constructor(options: PauseBadgeOptions = {}) {
    const {
      element: elementOrSelector,
      container: containerOrSelector,
      label = "Paused",
      target = window,
    } = options;

    this.target = target ?? null;

    const existing = resolveElement(elementOrSelector);

    if (existing) {
      this.element = existing;
      this.element.classList.add("hud-pause-badge");
      if (!this.element.textContent) {
        this.element.textContent = label;
      }
      if (!this.element.getAttribute("role")) {
        this.element.setAttribute("role", "status");
      }
      if (!this.element.getAttribute("aria-live")) {
        this.element.setAttribute("aria-live", "polite");
      }
    } else {
      const container = resolveElement(containerOrSelector) ?? document.querySelector(".hud-panel");
      this.element = createBadge(label);
      (container ?? document.body).appendChild(this.element);
    }

    this.element.classList.add("hud-pause-badge");
    this.hide();

    this.removeListeners.push(
      addTargetListener(this.target, HUD_PAUSE, (event) => this.onPauseEvent(event)),
      addTargetListener(this.target, HUD_GAME_OVER, () => this.onGameOver())
    );
  }

  private onPauseEvent(event: Event) {
    if (!isHudPauseEvent(event)) {
      return;
    }

    const { paused, gameOver, hasGameOver } = normaliseState(event.detail);
    this.isPaused = paused;
    if (hasGameOver || !paused) {
      this.isGameOver = gameOver;
    } else if (paused) {
      this.isGameOver = false;
    }
    this.updateVisibility();
  }

  private onGameOver() {
    this.isGameOver = true;
    this.isPaused = false;
    this.updateVisibility();
  }

  private updateVisibility() {
    const shouldShow = this.isPaused && !this.isGameOver;
    this.element.classList.toggle("is-hidden", !shouldShow);
    this.element.classList.toggle("is-visible", shouldShow);
    this.element.setAttribute("aria-hidden", shouldShow ? "false" : "true");
  }

  private hide() {
    this.isPaused = false;
    this.isGameOver = false;
    this.updateVisibility();
  }

  public destroy() {
    while (this.removeListeners.length > 0) {
      const remove = this.removeListeners.pop();
      remove?.();
    }
  }
}
