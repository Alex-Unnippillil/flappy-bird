import { HUD_GAME_OVER, type HudState } from '../constants';

type ElementTarget = string | HTMLElement;

export interface GameOverPanelElements {
  root: ElementTarget;
  title: ElementTarget;
  finalScore: ElementTarget;
  bestScore: ElementTarget;
  medalShelf: ElementTarget;
  buttons: ElementTarget;
}

export interface GameOverPanelOptions {
  document?: Document;
  onDismiss?: () => void;
}

export interface GameOverPayload {
  score?: number | string;
  best?: number | string;
  medal?: string | null;
}

interface PortalRecord {
  name: string;
  element: HTMLElement;
  placeholder: Comment | null;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function isHTMLElement(value: unknown, doc: Document): value is HTMLElement {
  if (!value) {
    return false;
  }
  const view = doc.defaultView ?? (globalThis as typeof globalThis | undefined);
  if (view && 'HTMLElement' in view) {
    return value instanceof (view as typeof window).HTMLElement;
  }
  return value instanceof HTMLElement;
}

function resolveElement(target: ElementTarget, doc: Document, name: string): HTMLElement {
  if (typeof target === 'string') {
    const found = doc.querySelector<HTMLElement>(target);
    if (!found) {
      throw new Error(`GameOverPanel: Unable to find ${name} element using selector "${target}".`);
    }
    return found;
  }

  if (isHTMLElement(target, doc)) {
    return target;
  }

  throw new Error(`GameOverPanel: Invalid ${name} element.`);
}

function toText(value: number | string | undefined): string {
  if (value === undefined || value === null) {
    return '';
  }
  return typeof value === 'number' ? String(value) : value;
}

export class GameOverPanel {
  private readonly doc: Document;

  private readonly root: HTMLElement;

  private readonly panel: HTMLElement;

  private readonly portalItems: PortalRecord[];

  private readonly finalScoreEl: HTMLElement;

  private readonly bestScoreEl: HTMLElement;

  private readonly medalShelfEl: HTMLElement;

  private readonly buttonsEl: HTMLElement;

  private readonly onDismiss?: () => void;

  private isActive = false;

  private previouslyFocused: HTMLElement | null = null;

  private readonly keydownListener: (event: KeyboardEvent) => void;

  constructor(elements: GameOverPanelElements, options: GameOverPanelOptions = {}) {
    const doc = options.document ?? globalThis.document;
    if (!doc) {
      throw new Error('GameOverPanel requires a document instance.');
    }

    this.doc = doc;
    this.root = resolveElement(elements.root, doc, 'root');
    const titleEl = resolveElement(elements.title, doc, 'title');
    this.finalScoreEl = resolveElement(elements.finalScore, doc, 'finalScore');
    this.bestScoreEl = resolveElement(elements.bestScore, doc, 'bestScore');
    this.medalShelfEl = resolveElement(elements.medalShelf, doc, 'medalShelf');
    this.buttonsEl = resolveElement(elements.buttons, doc, 'buttons');

    this.panel = doc.createElement('div');
    this.panel.className = 'hud-game-over-panel';
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-modal', 'true');
    this.panel.setAttribute('aria-label', 'Game over summary');
    this.panel.tabIndex = -1;

    this.portalItems = [
      { name: 'title', element: titleEl, placeholder: null },
      { name: 'finalScore', element: this.finalScoreEl, placeholder: null },
      { name: 'bestScore', element: this.bestScoreEl, placeholder: null },
      { name: 'medalShelf', element: this.medalShelfEl, placeholder: null },
      { name: 'buttons', element: this.buttonsEl, placeholder: null },
    ];

    this.onDismiss = options.onDismiss;
    this.keydownListener = (event: KeyboardEvent) => this.handleKeydown(event);
  }

  sync(state: HudState, payload?: GameOverPayload): void {
    if (state === HUD_GAME_OVER) {
      this.show(payload);
    } else {
      this.hide();
    }
  }

  destroy(): void {
    this.hide();
    for (const record of this.portalItems) {
      if (record.placeholder?.parentNode) {
        record.placeholder.parentNode.insertBefore(record.element, record.placeholder);
        record.placeholder.remove();
        record.placeholder = null;
      }
    }
  }

  private show(payload?: GameOverPayload): void {
    if (this.isActive) {
      this.updateContent(payload);
      return;
    }

    this.ensurePortals();
    if (!this.panel.isConnected) {
      this.root.appendChild(this.panel);
    }

    for (const record of this.portalItems) {
      this.panel.appendChild(record.element);
    }

    this.root.classList.remove('is-hidden');
    this.root.removeAttribute('aria-hidden');

    this.updateContent(payload);

    this.previouslyFocused = this.doc.activeElement as HTMLElement | null;
    this.doc.addEventListener('keydown', this.keydownListener, true);
    this.isActive = true;
    this.focusInitialElement();
  }

  private hide(): void {
    if (!this.isActive) {
      return;
    }

    this.doc.removeEventListener('keydown', this.keydownListener, true);
    this.restorePortals();
    if (this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel);
    }

    if (this.root.childElementCount === 0) {
      this.root.setAttribute('aria-hidden', 'true');
      this.root.classList.add('is-hidden');
    }

    if (this.previouslyFocused && typeof this.previouslyFocused.focus === 'function') {
      try {
        this.previouslyFocused.focus();
      } catch (_error) {
        // Swallow focus errors to avoid breaking dismissal.
      }
    }

    this.previouslyFocused = null;
    this.isActive = false;
  }

  private dismiss(): void {
    if (!this.isActive) {
      return;
    }
    this.hide();
    this.onDismiss?.();
  }

  private ensurePortals(): void {
    for (const record of this.portalItems) {
      if (record.placeholder || !record.element.parentNode) {
        continue;
      }
      const placeholder = this.doc.createComment(`portal:${record.name}`);
      record.element.parentNode.insertBefore(placeholder, record.element);
      record.placeholder = placeholder;
    }
  }

  private restorePortals(): void {
    for (const record of this.portalItems) {
      if (record.placeholder?.parentNode) {
        record.placeholder.parentNode.insertBefore(record.element, record.placeholder);
      }
    }
  }

  private updateContent(payload?: GameOverPayload): void {
    if (!payload) {
      return;
    }
    if (payload.score !== undefined) {
      this.finalScoreEl.textContent = toText(payload.score);
    }
    if (payload.best !== undefined) {
      this.bestScoreEl.textContent = toText(payload.best);
    }
    if ('medal' in payload) {
      if (payload.medal) {
        this.medalShelfEl.setAttribute('data-medal', payload.medal);
      } else {
        this.medalShelfEl.removeAttribute('data-medal');
      }
    }
  }

  private focusInitialElement(): void {
    const focusables = this.getFocusableElements();
    const target = focusables[0] ?? this.panel;
    target.focus();
  }

  private getFocusableElements(): HTMLElement[] {
    if (!this.isActive) {
      return [];
    }

    const candidates = Array.from(
      this.panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );

    const focusables = candidates.filter((element) => {
      if (element.getAttribute('aria-hidden') === 'true') {
        return false;
      }
      if (element.hasAttribute('disabled')) {
        return false;
      }
      if (element.tabIndex < 0) {
        return false;
      }
      return true;
    });

    if (focusables.length === 0 && this.panel.tabIndex >= 0) {
      focusables.push(this.panel);
    }

    return focusables;
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (!this.isActive) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.dismiss();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusables = this.getFocusableElements();
    if (focusables.length === 0) {
      event.preventDefault();
      this.panel.focus();
      return;
    }

    const activeElement = this.doc.activeElement as HTMLElement | null;
    let currentIndex = activeElement ? focusables.indexOf(activeElement) : -1;
    if (currentIndex === -1) {
      currentIndex = event.shiftKey ? 0 : focusables.length - 1;
    }

    let nextIndex = currentIndex + (event.shiftKey ? -1 : 1);
    if (nextIndex < 0) {
      nextIndex = focusables.length - 1;
    }
    if (nextIndex >= focusables.length) {
      nextIndex = 0;
    }

    event.preventDefault();
    focusables[nextIndex].focus();
  }
}

export default GameOverPanel;
