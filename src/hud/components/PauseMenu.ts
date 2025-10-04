export const PauseMenuEvent = {
  Open: "pause-menu:open",
  Close: "pause-menu:close",
  Resume: "pause-menu:resume",
  ToggleMute: "pause-menu:toggle-mute",
  Quit: "pause-menu:quit",
} as const;

export type PauseMenuEventName = (typeof PauseMenuEvent)[keyof typeof PauseMenuEvent];

export interface PauseMenuOptions {
  initialMuted?: boolean;
  label?: string;
  eventTarget?: EventTarget;
}

export interface PauseMenuToggleDetail {
  muted: boolean;
}

export interface PauseMenuEventDetailMap {
  [PauseMenuEvent.Open]: undefined;
  [PauseMenuEvent.Close]: undefined;
  [PauseMenuEvent.Resume]: undefined;
  [PauseMenuEvent.Quit]: undefined;
  [PauseMenuEvent.ToggleMute]: PauseMenuToggleDetail;
}

type PauseMenuEventListener<K extends PauseMenuEventName> = (
  event: CustomEvent<PauseMenuEventDetailMap[K]>
) => void;

const buttonOrder = ["resume", "mute", "quit"] as const;
type PauseMenuButtonId = (typeof buttonOrder)[number];

function isFocusable(element: Element | null | undefined): element is HTMLElement {
  return !!element && element instanceof HTMLElement && !element.hasAttribute("disabled");
}

export class PauseMenu {
  readonly element: HTMLDivElement;

  private readonly eventTarget: EventTarget;

  private readonly buttons: Record<PauseMenuButtonId, HTMLButtonElement>;

  private previouslyFocused: HTMLElement | null = null;

  private isOpen = false;

  private muted: boolean;

  constructor(options: PauseMenuOptions = {}) {
    this.eventTarget = options.eventTarget ?? new EventTarget();
    this.muted = Boolean(options.initialMuted);

    this.element = document.createElement("div");
    this.element.className = "pause-menu";
    this.element.setAttribute("role", "dialog");
    this.element.setAttribute("aria-modal", "true");
    this.element.setAttribute("aria-label", options.label ?? "Game paused");
    this.element.hidden = true;
    this.element.setAttribute("aria-hidden", "true");

    const heading = document.createElement("h2");
    heading.className = "pause-menu__title";
    heading.textContent = options.label ?? "Paused";

    const description = document.createElement("p");
    description.className = "pause-menu__description";
    description.textContent = "Take a breather or adjust your settings.";

    const actions = document.createElement("div");
    actions.className = "pause-menu__actions";

    this.buttons = {
      resume: this.createButton("Resume", "resume"),
      mute: this.createButton("Mute", "mute"),
      quit: this.createButton("Quit", "quit"),
    };

    actions.append(
      this.buttons.resume,
      this.buttons.mute,
      this.buttons.quit
    );

    this.element.append(heading, description, actions);

    this.updateMuteButton();

    this.element.addEventListener("keydown", (event) => this.handleKeydown(event));
  }

  /** Adds an event listener for menu events. */
  addEventListener<K extends PauseMenuEventName>(
    type: K,
    listener: PauseMenuEventListener<K>
  ) {
    this.eventTarget.addEventListener(type, listener as EventListener);
  }

  /** Removes a previously registered event listener. */
  removeEventListener<K extends PauseMenuEventName>(
    type: K,
    listener: PauseMenuEventListener<K>
  ) {
    this.eventTarget.removeEventListener(type, listener as EventListener);
  }

  /** Opens the pause menu and traps focus within its buttons. */
  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    this.element.hidden = false;
    this.element.setAttribute("aria-hidden", "false");
    this.focusFirstButton();
    this.publish(PauseMenuEvent.Open);
  }

  /** Closes the pause menu and restores focus to the previously focused element. */
  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.element.hidden = true;
    this.element.setAttribute("aria-hidden", "true");

    if (isFocusable(this.previouslyFocused) && document.contains(this.previouslyFocused)) {
      this.previouslyFocused.focus();
    }

    this.publish(PauseMenuEvent.Close);
  }

  /** Updates the mute toggle state. */
  setMuted(nextMuted: boolean) {
    this.muted = Boolean(nextMuted);
    this.updateMuteButton();
  }

  /** Returns whether the pause menu is currently open. */
  isVisible() {
    return this.isOpen;
  }

  /** Removes the menu element from the DOM. */
  destroy() {
    this.close();
    if (this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
    }
  }

  private createButton(label: string, id: PauseMenuButtonId): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "game-button pause-menu__button";
    button.dataset.pauseMenuButton = id;
    button.textContent = label;
    button.addEventListener("click", () => this.handleButtonActivate(id));
    return button;
  }

  private handleButtonActivate(id: PauseMenuButtonId) {
    switch (id) {
      case "resume":
        this.publish(PauseMenuEvent.Resume);
        this.close();
        break;
      case "mute":
        this.muted = !this.muted;
        this.updateMuteButton();
        this.publish(PauseMenuEvent.ToggleMute, { muted: this.muted });
        break;
      case "quit":
        this.publish(PauseMenuEvent.Quit);
        break;
      default:
        break;
    }
  }

  private focusFirstButton() {
    const first = this.buttons.resume;
    if (isFocusable(first)) {
      first.focus();
    }
  }

  private getFocusableButtons(): HTMLButtonElement[] {
    return buttonOrder
      .map((id) => this.buttons[id])
      .filter((button) => isFocusable(button));
  }

  private handleKeydown(event: KeyboardEvent) {
    if (!this.isOpen) return;

    if (event.key === "Tab") {
      const focusable = this.getFocusableButtons();
      if (!focusable.length) {
        return;
      }

      const currentIndex = focusable.indexOf(document.activeElement as HTMLButtonElement);
      let nextIndex = currentIndex;

      if (event.shiftKey) {
        nextIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
      } else {
        nextIndex = currentIndex === focusable.length - 1 ? 0 : currentIndex + 1;
      }

      event.preventDefault();
      focusable[nextIndex]?.focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      this.publish(PauseMenuEvent.Resume);
      this.close();
    }
  }

  private updateMuteButton() {
    const muteButton = this.buttons.mute;
    muteButton.setAttribute("aria-pressed", this.muted ? "true" : "false");
    muteButton.textContent = this.muted ? "Unmute" : "Mute";
  }

  private publish<K extends PauseMenuEventName>(
    type: K,
    detail?: PauseMenuEventDetailMap[K]
  ) {
    const event = new CustomEvent(type, {
      bubbles: false,
      cancelable: false,
      detail,
    });
    this.eventTarget.dispatchEvent(event);
  }
}
