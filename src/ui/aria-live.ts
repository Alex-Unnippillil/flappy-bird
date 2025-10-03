const HIDDEN_STYLE: Partial<CSSStyleDeclaration> = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  border: "0",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
};

type AriaPolitenessSetting = "polite" | "assertive";

type AnnouncementScheduler = (message: string) => void;

export interface AriaLiveAnnouncer {
  announce: AnnouncementScheduler;
  announceScore: (score: number) => void;
  announceState: (stateMessage: string) => void;
  announceGameOver: (finalScore: number) => void;
  destroy: () => void;
}

interface AriaLiveOptions {
  politeness?: AriaPolitenessSetting;
  debounceMs?: number;
}

function applyHiddenStyles(region: HTMLElement) {
  Object.assign(region.style, HIDDEN_STYLE);
}

export function createAriaLiveAnnouncer({
  politeness = "polite",
  debounceMs = 400,
}: AriaLiveOptions = {}): AriaLiveAnnouncer {
  const region = document.createElement("div");
  region.setAttribute("role", "status");
  region.setAttribute("aria-live", politeness);
  region.setAttribute("aria-atomic", "true");
  region.dataset.component = "aria-live";
  applyHiddenStyles(region);
  document.body.appendChild(region);

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingMessage = "";
  let lastAnnouncedMessage = "";

  const flushMessage = (message: string) => {
    if (message === lastAnnouncedMessage) {
      // Force assistive tech to register repeated messages by clearing first.
      region.textContent = "";
    }

    region.textContent = message;
    lastAnnouncedMessage = message;
  };

  const scheduleAnnouncement: AnnouncementScheduler = (message) => {
    pendingMessage = message;

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      flushMessage(pendingMessage);
      pendingMessage = "";
      timeoutId = null;
    }, debounceMs);
  };

  return {
    announce: scheduleAnnouncement,
    announceScore: (score: number) => {
      scheduleAnnouncement(`Score ${score}.`);
    },
    announceState: (stateMessage: string) => {
      scheduleAnnouncement(stateMessage);
    },
    announceGameOver: (finalScore: number) => {
      scheduleAnnouncement(`Game over. Final score ${finalScore}. Click to play again.`);
    },
    destroy: () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      region.remove();
    },
  };
}
