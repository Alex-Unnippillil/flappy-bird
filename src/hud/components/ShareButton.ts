export type ShareFeedbackType = "success" | "error";

export interface ShareFeedback {
  type: ShareFeedbackType;
  message: string;
}

export interface ShareSessionDetails {
  score: number;
  bestScore?: number;
  speedLabel?: string;
  speedMultiplier?: number;
  durationSeconds?: number;
  powerUpsCollected?: number;
  url?: string;
  timestamp?: Date;
}

export interface ShareButtonOptions {
  target: string | HTMLElement;
  session: () => ShareSessionDetails;
  onFeedback?: (feedback: ShareFeedback) => void;
  successMessage?: string;
  errorMessage?: string;
  document?: Document;
  navigator?: Navigator;
}

export interface ShareButtonController {
  share: () => Promise<boolean>;
  dispose: () => void;
}

const DEFAULT_SUCCESS_MESSAGE = "Session summary copied to clipboard!";
const DEFAULT_ERROR_MESSAGE = "Unable to copy session summary. Please try again.";

function resolveTarget(target: string | HTMLElement, doc: Document): HTMLElement {
  if (typeof target === "string") {
    const element = doc.querySelector<HTMLElement>(target);
    if (!element) {
      throw new Error(`Share button selector \"${target}\" did not match any elements.`);
    }
    return element;
  }

  return target;
}

function defaultFeedback(button: HTMLElement): (feedback: ShareFeedback) => void {
  const initialAriaLabel = button.getAttribute("aria-label");

  return ({ type, message }) => {
    button.dataset.shareStatus = type;
    button.dataset.shareMessage = message;
    button.setAttribute("title", message);

    if (initialAriaLabel) {
      button.setAttribute("aria-label", `${initialAriaLabel}. ${message}`);
    } else {
      button.setAttribute("aria-label", message);
    }
  };
}

function formatDuration(seconds?: number): string | undefined {
  if (!Number.isFinite(seconds) || seconds === undefined) {
    return undefined;
  }

  const totalSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  if (minutes === 0) {
    return `${secs}s`;
  }

  if (secs === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${secs}s`;
}

function resolveShareUrl(explicitUrl?: string): string | undefined {
  if (explicitUrl) return explicitUrl;
  if (typeof window !== "undefined" && window.location) {
    return window.location.href;
  }
  return undefined;
}

export function formatShareSession(details: ShareSessionDetails): string {
  const lines: string[] = [];

  lines.push(`I just scored ${details.score} in Flappy Bird!`);

  if (typeof details.bestScore === "number") {
    lines.push(`Personal best: ${details.bestScore}`);
  }

  if (details.speedLabel) {
    lines.push(`Top speed: ${details.speedLabel}`);
  } else if (typeof details.speedMultiplier === "number") {
    lines.push(`Top speed multiplier: ${details.speedMultiplier.toFixed(2)}x`);
  }

  const duration = formatDuration(details.durationSeconds);
  if (duration) {
    lines.push(`Run duration: ${duration}`);
  }

  if (typeof details.powerUpsCollected === "number") {
    lines.push(`Power-ups collected: ${details.powerUpsCollected}`);
  }

  if (details.timestamp instanceof Date && !Number.isNaN(details.timestamp.getTime())) {
    lines.push(`Session played: ${details.timestamp.toLocaleString()}`);
  }

  const shareUrl = resolveShareUrl(details.url);
  if (shareUrl) {
    lines.push(`Play now: ${shareUrl}`);
  }

  lines.push("#FlappyBird #WebGames");

  return lines.join("\n");
}

async function copyToClipboard(
  text: string,
  env: { document: Document; navigator?: Navigator }
): Promise<boolean> {
  const { document: doc } = env;
  const nav = env.navigator ?? (typeof navigator !== "undefined" ? navigator : undefined);

  if (nav?.clipboard?.writeText) {
    try {
      await nav.clipboard.writeText(text);
      return true;
    } catch {
      // Intentionally fall back to the legacy copy strategy
    }
  }

  const textarea = doc.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  doc.body?.appendChild(textarea);

  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  let successful = false;

  const execCommand = (doc as Document & { execCommand?: (command: string) => boolean }).execCommand;
  if (typeof execCommand === "function") {
    try {
      successful = execCommand.call(doc, "copy");
    } catch {
      successful = false;
    }
  }

  doc.body?.removeChild(textarea);

  return successful;
}

export function createShareButton(options: ShareButtonOptions): ShareButtonController {
  const doc = options.document ?? (typeof document !== "undefined" ? document : undefined);

  if (!doc) {
    throw new Error("ShareButton requires a document context.");
  }

  const button = resolveTarget(options.target, doc);
  const provideFeedback = options.onFeedback ?? defaultFeedback(button);
  const successMessage = options.successMessage ?? DEFAULT_SUCCESS_MESSAGE;
  const errorMessage = options.errorMessage ?? DEFAULT_ERROR_MESSAGE;

  const share = async (): Promise<boolean> => {
    try {
      const summary = options.session();
      const text = formatShareSession(summary);
      const copied = await copyToClipboard(text, {
        document: doc,
        navigator: options.navigator,
      });

      if (!copied) {
        throw new Error("Clipboard copy failed");
      }

      provideFeedback({ type: "success", message: successMessage });
      return true;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error ?? "Unknown error");
      console.warn("ShareButton copy failed:", reason);
      provideFeedback({ type: "error", message: errorMessage });
      return false;
    }
  };

  const handleClick = (event: Event) => {
    event.preventDefault();
    void share();
  };

  button.addEventListener("click", handleClick);

  return {
    share,
    dispose() {
      button.removeEventListener("click", handleClick);
    },
  };
}

