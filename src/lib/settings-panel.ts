// File Overview: This module belongs to src/lib/settings-panel.ts.

import HighContrastManager from './high-contrast-manager';

export default class SettingsPanel {
  private openButton?: HTMLButtonElement;
  private panel?: HTMLDivElement;
  private closeButton?: HTMLButtonElement;
  private toggle?: HTMLInputElement;
  private keydownHandler?: (event: KeyboardEvent) => void;

  constructor() {
    const openButton = document.querySelector<HTMLButtonElement>('#settings-button');
    const panel = document.querySelector<HTMLDivElement>('#settings-panel');
    const toggle = panel?.querySelector<HTMLInputElement>('#high-contrast-toggle') ?? undefined;
    const closeButton = panel?.querySelector<HTMLButtonElement>('[data-close-settings]') ?? undefined;

    if (!openButton || !panel || !toggle || !closeButton) {
      console.warn('SettingsPanel: required settings elements are missing.');
      return;
    }

    this.openButton = openButton;
    this.panel = panel;
    this.toggle = toggle;
    this.closeButton = closeButton;
    this.keydownHandler = this.onKeydown.bind(this);

    this.bindEvents();
    this.syncToggle(HighContrastManager.isEnabled());
    HighContrastManager.subscribe((enabled) => this.syncToggle(enabled));
  }

  private bindEvents(): void {
    if (!this.openButton || !this.panel || !this.closeButton || !this.toggle) return;

    this.openButton.addEventListener('click', () => this.open());
    this.closeButton.addEventListener('click', () => this.close());
    this.panel.addEventListener('click', (event: MouseEvent) => {
      if (event.target === this.panel) this.close();
    });

    this.toggle.addEventListener('change', () => {
      HighContrastManager.setEnabled(this.toggle!.checked);
    });

    if (this.keydownHandler) {
      document.addEventListener('keydown', this.keydownHandler);
    }
  }

  private onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    if (!this.panel || this.panel.hasAttribute('hidden')) return;

    event.preventDefault();
    this.close();
  }

  private open(): void {
    if (!this.panel || !this.openButton || !this.toggle) return;
    this.panel.removeAttribute('hidden');
    this.openButton.setAttribute('aria-expanded', 'true');
    window.setTimeout(() => this.toggle?.focus({ preventScroll: true }), 0);
  }

  private close(): void {
    if (!this.panel || !this.openButton) return;
    this.panel.setAttribute('hidden', '');
    this.openButton.setAttribute('aria-expanded', 'false');
    this.openButton.focus({ preventScroll: true });
  }

  private syncToggle(enabled: boolean): void {
    if (!this.toggle) return;
    this.toggle.checked = enabled;
    this.toggle.setAttribute('aria-checked', enabled ? 'true' : 'false');
  }
}
