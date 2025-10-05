// File Overview: This module belongs to src/model/intro-tooltip.ts.
import Storage from '../lib/storage';

const INTRO_TOOLTIP_STORAGE_KEY = 'intro-tooltip-dismissed';
const DEFAULT_TIMEOUT = 6500;

type DismissReason = 'interaction' | 'timeout' | 'programmatic';

export default class IntroTooltip {
  private container: HTMLDivElement | null = null;
  private hideTimer: number | null = null;
  private hasListeners = false;
  private visible = false;
  private readonly pointerHandler = this.handleInteraction.bind(this);
  private readonly keyHandler = this.handleInteraction.bind(this);

  constructor(private readonly timeoutMs: number = DEFAULT_TIMEOUT) {}

  public showIfNeeded(): void {
    if (this.visible) return;
    if (Storage.get(INTRO_TOOLTIP_STORAGE_KEY) === true) return;

    this.ensureElements();
    if (!this.container) return;

    this.container.dataset.state = 'visible';
    this.container.setAttribute('aria-hidden', 'false');
    this.visible = true;
    this.registerListeners();

    if (this.hideTimer !== null) {
      window.clearTimeout(this.hideTimer);
    }
    this.hideTimer = window.setTimeout(() => {
      this.hide('timeout');
    }, this.timeoutMs);
  }

  public dismiss(): void {
    this.hide('interaction');
  }

  public hide(reason: DismissReason = 'programmatic'): void {
    if (!this.visible || !this.container) return;

    this.container.dataset.state = 'hidden';
    this.container.setAttribute('aria-hidden', 'true');
    this.visible = false;

    if (this.hideTimer !== null) {
      window.clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    if (reason === 'interaction' || reason === 'timeout') {
      try {
        Storage.save(INTRO_TOOLTIP_STORAGE_KEY, true);
      } catch (err) {
        console.warn('Failed to persist intro tooltip preference', err);
      }
    }

    this.unregisterListeners();
  }

  private handleInteraction(): void {
    if (!this.visible) return;
    this.hide('interaction');
  }

  private ensureElements(): void {
    if (this.container) return;

    const container = document.createElement('div');
    container.id = 'intro-tooltip';
    container.dataset.state = 'hidden';
    container.setAttribute('aria-hidden', 'true');
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');

    const bubble = document.createElement('div');
    bubble.className = 'intro-tooltip__bubble';

    const title = document.createElement('p');
    title.className = 'intro-tooltip__title';
    title.textContent = 'Tap to flap!';

    const description = document.createElement('p');
    description.className = 'intro-tooltip__description';
    description.textContent = 'Tap anywhere or press Space to start flying.';

    bubble.appendChild(title);
    bubble.appendChild(description);
    container.appendChild(bubble);
    document.body.appendChild(container);

    this.container = container;
  }

  private registerListeners(): void {
    if (this.hasListeners) return;

    window.addEventListener('pointerdown', this.pointerHandler, true);
    window.addEventListener('keydown', this.keyHandler, true);
    this.hasListeners = true;
  }

  private unregisterListeners(): void {
    if (!this.hasListeners) return;

    window.removeEventListener('pointerdown', this.pointerHandler, true);
    window.removeEventListener('keydown', this.keyHandler, true);
    this.hasListeners = false;
  }
}
