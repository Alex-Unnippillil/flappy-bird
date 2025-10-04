export interface AriaAnnouncerOptions {
  /**
   * Optional container that will host the aria-live region. If omitted the
   * region is appended to the document body.
   */
  container?: HTMLElement;
  /**
   * Amount of time (in milliseconds) to wait before announcing medal updates.
   * Subsequent medal updates within this window are coalesced into a single
   * announcement using the most recent message.
   */
  medalDebounceMs?: number;
  /**
   * Maximum number of announcements remembered to prevent duplicate messages
   * from being re-announced.
   */
  recentMessageLimit?: number;
}

const DEFAULT_MEDAL_DEBOUNCE = 400;
const DEFAULT_RECENT_LIMIT = 5;

/**
 * Manages a hidden aria-live region used for game announcements. Medal updates
 * are debounced so only the latest message within the debounce window is
 * announced, preventing a flurry of screen reader chatter when medals are
 * awarded in rapid succession.
 */
export class AriaAnnouncer {
  private readonly region: HTMLElement;
  private readonly recentMessageLimit: number;
  private readonly medalDebounceMs: number;
  private readonly recentMessages: string[] = [];

  private pendingMedalMessage: string | null = null;
  private medalTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(options: AriaAnnouncerOptions = {}) {
    const doc = options.container?.ownerDocument ?? globalThis.document;
    if (!doc) {
      throw new Error('Cannot create an aria-live region without a document.');
    }

    this.region = doc.createElement('div');
    this.region.setAttribute('role', 'status');
    this.region.setAttribute('aria-live', 'polite');
    this.region.setAttribute('aria-atomic', 'true');
    this.region.setAttribute('data-component', 'aria-announcer');
    this.region.style.position = 'absolute';
    this.region.style.width = '1px';
    this.region.style.height = '1px';
    this.region.style.margin = '-1px';
    this.region.style.border = '0';
    this.region.style.padding = '0';
    this.region.style.overflow = 'hidden';
    this.region.style.clip = 'rect(0 0 0 0)';
    this.region.style.clipPath = 'inset(50%)';
    this.region.style.whiteSpace = 'nowrap';

    this.recentMessageLimit = Math.max(1, options.recentMessageLimit ?? DEFAULT_RECENT_LIMIT);
    this.medalDebounceMs = Math.max(0, options.medalDebounceMs ?? DEFAULT_MEDAL_DEBOUNCE);

    const container = options.container ?? doc.body;
    if (!container) {
      throw new Error('Cannot append aria-live region without a container element.');
    }

    container.appendChild(this.region);
  }

  /** Returns the live region element for testing or custom DOM management. */
  get element(): HTMLElement {
    return this.region;
  }

  /** Announces a generic message immediately if it has not been recently spoken. */
  announce(message: string): void {
    this.flushMedalTimer();
    this.emit(message);
  }

  /**
   * Queues a medal announcement. If another medal update occurs before the
   * debounce timer elapses the latest message replaces the pending update.
   */
  announceMedal(message: string): void {
    if (!message.trim()) {
      return;
    }

    this.pendingMedalMessage = message;
    if (this.medalTimer) {
      clearTimeout(this.medalTimer);
    }

    this.medalTimer = setTimeout(() => {
      if (this.pendingMedalMessage) {
        this.emit(this.pendingMedalMessage);
        this.pendingMedalMessage = null;
      }
      this.medalTimer = null;
    }, this.medalDebounceMs);
  }

  /** Releases references and removes the live region from the DOM. */
  dispose(): void {
    this.flushMedalTimer();
    if (this.region.parentNode) {
      this.region.parentNode.removeChild(this.region);
    }
  }

  private flushMedalTimer(): void {
    if (this.medalTimer) {
      clearTimeout(this.medalTimer);
      this.medalTimer = null;
      if (this.pendingMedalMessage) {
        this.emit(this.pendingMedalMessage);
        this.pendingMedalMessage = null;
      }
    }
  }

  private emit(message: string): void {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    if (this.recentMessages.includes(trimmed)) {
      return;
    }

    this.recentMessages.push(trimmed);
    if (this.recentMessages.length > this.recentMessageLimit) {
      this.recentMessages.shift();
    }

    this.region.textContent = '';
    // Reading back offsetHeight forces assistive tech to acknowledge the change
    // when the same element is reused for subsequent announcements.
    void this.region.offsetHeight;
    this.region.textContent = trimmed;
  }
}
