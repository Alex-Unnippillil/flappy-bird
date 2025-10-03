const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])';

export type PauseMenuOptions = {
  onResume: () => void;
  onRestart: () => void;
};

export type PauseMenu = {
  element: HTMLDivElement;
  open: () => void;
  close: () => void;
  isOpen: () => boolean;
};

export function createPauseMenu(options: PauseMenuOptions): PauseMenu {
  const overlay = document.createElement("div");
  overlay.className = "pause-menu-overlay";
  overlay.id = "pause-menu";
  overlay.hidden = true;
  overlay.setAttribute("role", "presentation");
  overlay.setAttribute("aria-hidden", "true");

  const dialog = document.createElement("div");
  dialog.className = "pause-menu";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "pause-menu-title");
  dialog.setAttribute("aria-describedby", "pause-menu-description");
  dialog.tabIndex = -1;

  const heading = document.createElement("h2");
  heading.id = "pause-menu-title";
  heading.textContent = "Game paused";

  const description = document.createElement("p");
  description.id = "pause-menu-description";
  description.textContent = "Select an option to continue playing or restart the round.";

  const buttonsWrapper = document.createElement("div");
  buttonsWrapper.className = "pause-menu__buttons";

  const resumeDescription = document.createElement("p");
  resumeDescription.id = "pause-menu-resume-description";
  resumeDescription.className = "sr-only";
  resumeDescription.textContent = "Return to the current round exactly where you left off.";

  const resumeButton = document.createElement("button");
  resumeButton.type = "button";
  resumeButton.className = "pause-menu__button";
  resumeButton.textContent = "Resume game";
  resumeButton.setAttribute("aria-describedby", resumeDescription.id);
  resumeButton.addEventListener("click", () => {
    closeMenu();
    options.onResume();
  });

  const restartDescription = document.createElement("p");
  restartDescription.id = "pause-menu-restart-description";
  restartDescription.className = "sr-only";
  restartDescription.textContent = "Start a brand new round from the beginning.";

  const restartButton = document.createElement("button");
  restartButton.type = "button";
  restartButton.className = "pause-menu__button pause-menu__button--secondary";
  restartButton.textContent = "Restart";
  restartButton.setAttribute("aria-describedby", restartDescription.id);
  restartButton.addEventListener("click", () => {
    closeMenu();
    options.onRestart();
  });

  buttonsWrapper.append(resumeButton, restartButton);

  dialog.append(heading, description, buttonsWrapper, resumeDescription, restartDescription);
  overlay.append(dialog);
  document.body.append(overlay);

  let isOpen = false;
  let previouslyFocusedElement: HTMLElement | null = null;

  function focusFirstControl() {
    const focusable = getFocusableElements();
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      dialog.focus();
    }
  }

  function getFocusableElements(): HTMLElement[] {
    return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (element) => !element.hasAttribute("disabled") && element.offsetParent !== null
    );
  }

  function trapFocus(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      options.onResume();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusable = getFocusableElements();
    if (focusable.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
    const lastIndex = focusable.length - 1;

    if (event.shiftKey) {
      if (currentIndex <= 0) {
        focusable[lastIndex].focus();
        event.preventDefault();
      }
      return;
    }

    if (currentIndex === -1 || currentIndex === lastIndex) {
      focusable[0].focus();
      event.preventDefault();
    }
  }

  function enforceFocus(event: FocusEvent) {
    if (!isOpen) {
      return;
    }

    if (!dialog.contains(event.target as Node)) {
      event.stopPropagation();
      focusFirstControl();
    }
  }

  function openMenu() {
    if (isOpen) {
      return;
    }

    previouslyFocusedElement = document.activeElement as HTMLElement | null;
    isOpen = true;
    overlay.hidden = false;
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("pause-menu-open");
    document.addEventListener("keydown", trapFocus);
    document.addEventListener("focusin", enforceFocus);
    requestAnimationFrame(() => {
      focusFirstControl();
    });
  }

  function closeMenu() {
    if (!isOpen) {
      return;
    }

    isOpen = false;
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("pause-menu-open");
    document.removeEventListener("keydown", trapFocus);
    document.removeEventListener("focusin", enforceFocus);

    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus({ preventScroll: true });
      previouslyFocusedElement = null;
    }
  }

  return {
    element: overlay,
    open: openMenu,
    close: closeMenu,
    isOpen: () => isOpen,
  };
}
