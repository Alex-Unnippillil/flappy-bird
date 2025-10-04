const visuallyHiddenStyles = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: "0",
} as const;

export type AriaAnnouncerOptions = {
  /**
   * Duration in milliseconds to debounce announcements. Defaults to 1000ms.
   */
  debounceMs?: number;
  /**
   * Formatter applied to the score before announcing. Defaults to
   * `Score <value>`.
   */
  formatMessage?: (score: number) => string;
};

export class AriaAnnouncer {
  readonly element: HTMLDivElement;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private pendingScore: number | null = null;
  private lastAnnouncedScore: number | null = null;
  private readonly debounceMs: number;
  private readonly formatMessage: (score: number) => string;

  constructor({ debounceMs = 1000, formatMessage }: AriaAnnouncerOptions = {}) {
    this.debounceMs = debounceMs;
    this.formatMessage = formatMessage ?? ((score) => `Score ${score}`);

    this.element = document.createElement("div");
    this.element.setAttribute("aria-live", "polite");
    this.element.setAttribute("role", "status");
    this.element.setAttribute("aria-atomic", "true");

    Object.assign(this.element.style, visuallyHiddenStyles);

    // Ensure the live region is part of the accessibility tree.
    document.body.appendChild(this.element);
  }

  announceScore(score: number) {
    if (this.lastAnnouncedScore === score || this.pendingScore === score) {
      return;
    }

    this.pendingScore = score;

    if (this.timer) {
      return;
    }

    this.timer = setTimeout(() => {
      const scoreToAnnounce = this.pendingScore;
      this.pendingScore = null;
      this.timer = null;

      if (scoreToAnnounce === null) {
        return;
      }

      if (scoreToAnnounce === this.lastAnnouncedScore) {
        return;
      }

      this.element.textContent = this.formatMessage(scoreToAnnounce);
      this.lastAnnouncedScore = scoreToAnnounce;
    }, this.debounceMs);
  }

  clear() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.pendingScore = null;
  }

  destroy() {
    this.clear();
    this.element.remove();
  }
}

export default AriaAnnouncer;
