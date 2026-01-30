import { HUD_RETRY, hudEventBus } from "../bus";
import "../styles/retry-button.css";

export interface RetryButtonOptions {
  /**
   * Custom label for the button. Defaults to "Retry".
   */
  label?: string;
  /**
   * Accessible description announced to assistive technology.
   */
  ariaLabel?: string;
  /**
   * Duration of the disabled cooldown in milliseconds.
   */
  cooldownMs?: number;
  /**
   * Document instance used to create the button. Primarily useful for tests.
   */
  targetDocument?: Document;
}

const DEFAULT_COOLDOWN = 400;
const ACTIVATION_KEYS = new Set(["Enter", "Space"]);

type TimerView = Pick<typeof globalThis, "setTimeout" | "clearTimeout">;

export class RetryButton {
  readonly element: HTMLButtonElement;
  private readonly cooldownMs: number;
  private readonly view: TimerView;
  private cooldownTimer: ReturnType<typeof globalThis.setTimeout> | null = null;
  private isKeyboardActivation = false;

  constructor(options: RetryButtonOptions = {}) {
    const {
      label = "Retry",
      ariaLabel = "Retry the game",
      cooldownMs = DEFAULT_COOLDOWN,
      targetDocument = typeof document !== "undefined" ? document : undefined,
    } = options;

    if (!targetDocument) {
      throw new Error("RetryButton requires a document to render");
    }

    const view = targetDocument.defaultView ?? globalThis;

    this.cooldownMs = cooldownMs;
    this.view = view as TimerView;
    this.element = targetDocument.createElement("button");
    this.element.type = "button";
    this.element.classList.add("retry-button");
    this.element.textContent = label;
    this.element.setAttribute("aria-label", ariaLabel);

    this.element.addEventListener("click", this.handleClick);
    this.element.addEventListener("keydown", this.handleKeyDown);
    this.element.addEventListener("keyup", this.handleKeyUp);
  }

  private readonly handleClick = (event: MouseEvent) => {
    event.preventDefault();
    this.activate();
  };

  private readonly handleKeyDown = (event: KeyboardEvent) => {
    if (event.repeat) return;
    if (!ACTIVATION_KEYS.has(event.code)) return;

    this.isKeyboardActivation = true;
    event.preventDefault();
  };

  private readonly handleKeyUp = (event: KeyboardEvent) => {
    if (!this.isKeyboardActivation) return;
    if (!ACTIVATION_KEYS.has(event.code)) return;

    this.isKeyboardActivation = false;
    event.preventDefault();
    this.activate();
  };

  private activate(): void {
    if (this.element.disabled) {
      return;
    }

    hudEventBus.publish(HUD_RETRY);
    this.startCooldown();
  }

  private startCooldown(): void {
    this.element.disabled = true;
    this.element.setAttribute("aria-disabled", "true");

    if (this.cooldownTimer !== null) {
      this.view.clearTimeout(this.cooldownTimer);
    }

    this.cooldownTimer = this.view.setTimeout(() => {
      this.element.disabled = false;
      this.element.removeAttribute("aria-disabled");
      this.cooldownTimer = null;
    }, this.cooldownMs);
  }

  destroy(): void {
    this.element.removeEventListener("click", this.handleClick);
    this.element.removeEventListener("keydown", this.handleKeyDown);
    this.element.removeEventListener("keyup", this.handleKeyUp);
    if (this.cooldownTimer !== null) {
      this.view.clearTimeout(this.cooldownTimer);
      this.cooldownTimer = null;
    }
  }
}

export function renderRetryButton(
  container: Element,
  options: RetryButtonOptions = {}
): RetryButton {
  const button = new RetryButton({
    ...options,
    targetDocument:
      options.targetDocument ?? container.ownerDocument ?? document,
  });
  container.appendChild(button.element);
  return button;
}

export { HUD_RETRY } from "../bus";
