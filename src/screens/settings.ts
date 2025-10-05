// File Overview: This module belongs to src/screens/settings.ts.
import ParentClass from '../abstracts/parent-class';
import { type IScreenChangerObject } from '../lib/screen-changer';
import { settings } from '../lib/settings';
import Sfx from '../model/sfx';
import Game from '../game';

const VOLUME_MAX = 1;

export default class SettingsScreen
  extends ParentClass
  implements IScreenChangerObject
{
  private readonly game: Game;
  private container: HTMLDivElement;
  private panel: HTMLDivElement;
  private closeButton: HTMLButtonElement;
  private launcherButton: HTMLButtonElement;
  private volumeSlider: HTMLInputElement;
  private volumeValue: HTMLSpanElement;
  private reducedMotionToggle: HTMLInputElement;
  private themeSelect: HTMLSelectElement;
  private fpsSelect: HTMLSelectElement;
  private controlSelect: HTMLSelectElement;
  private isOpen: boolean;

  constructor(game: Game) {
    super();
    this.game = game;
    this.container = document.createElement('div');
    this.panel = document.createElement('div');
    this.closeButton = document.createElement('button');
    this.launcherButton = document.createElement('button');
    this.volumeSlider = document.createElement('input');
    this.volumeValue = document.createElement('span');
    this.reducedMotionToggle = document.createElement('input');
    this.themeSelect = document.createElement('select');
    this.fpsSelect = document.createElement('select');
    this.controlSelect = document.createElement('select');
    this.isOpen = false;

    this.setupDom();
  }

  private setupDom(): void {
    const appendToBody = (element: HTMLElement) => {
      if (document.readyState === 'loading') {
        window.addEventListener(
          'DOMContentLoaded',
          () => {
            document.body.append(element);
          },
          { once: true }
        );
        return;
      }

      document.body.append(element);
    };

    this.container.className = 'settings-overlay';
    this.container.setAttribute('role', 'dialog');
    this.container.setAttribute('aria-modal', 'true');
    this.container.setAttribute('aria-labelledby', 'settings-title');
    this.container.hidden = true;

    this.panel.className = 'settings-overlay__panel';
    this.panel.tabIndex = -1;

    const title = document.createElement('h2');
    title.id = 'settings-title';
    title.textContent = 'Settings';

    this.closeButton.type = 'button';
    this.closeButton.className = 'settings-overlay__close';
    this.closeButton.textContent = 'Back';

    this.launcherButton.type = 'button';
    this.launcherButton.className = 'settings-launcher';
    this.launcherButton.setAttribute('aria-label', 'Open settings');
    this.launcherButton.innerHTML = '&#9881;';
    this.launcherButton.hidden = true;

    this.volumeSlider.type = 'range';
    this.volumeSlider.min = '0';
    this.volumeSlider.max = '100';
    this.volumeSlider.step = '1';
    this.volumeSlider.name = 'volume';
    this.volumeSlider.id = 'settings-volume';

    const volumeLabel = document.createElement('label');
    volumeLabel.htmlFor = this.volumeSlider.id;
    volumeLabel.textContent = 'Audio volume';
    this.volumeValue.className = 'settings-overlay__value';

    const reducedLabel = document.createElement('label');
    reducedLabel.htmlFor = 'settings-reduced-motion';
    reducedLabel.textContent = 'Reduced motion';

    this.reducedMotionToggle.type = 'checkbox';
    this.reducedMotionToggle.id = reducedLabel.htmlFor;
    this.reducedMotionToggle.name = 'reducedMotion';

    const themeLabel = document.createElement('label');
    themeLabel.htmlFor = 'settings-theme';
    themeLabel.textContent = 'Theme';
    this.themeSelect.id = themeLabel.htmlFor;
    this.themeSelect.name = 'theme';

    this.addSelectOption(this.themeSelect, 'system', 'Match system');
    this.addSelectOption(this.themeSelect, 'day', 'Day');
    this.addSelectOption(this.themeSelect, 'night', 'Night');

    const fpsLabel = document.createElement('label');
    fpsLabel.htmlFor = 'settings-fps';
    fpsLabel.textContent = 'FPS cap';
    this.fpsSelect.id = fpsLabel.htmlFor;
    this.fpsSelect.name = 'fpsCap';

    this.addSelectOption(this.fpsSelect, '0', 'Unlimited');
    this.addSelectOption(this.fpsSelect, '30', '30 FPS');
    this.addSelectOption(this.fpsSelect, '60', '60 FPS');
    this.addSelectOption(this.fpsSelect, '120', '120 FPS');

    const controlLabel = document.createElement('label');
    controlLabel.htmlFor = 'settings-control';
    controlLabel.textContent = 'Control scheme';
    this.controlSelect.id = controlLabel.htmlFor;
    this.controlSelect.name = 'controlScheme';

    this.addSelectOption(this.controlSelect, 'tap', 'Tap / Click');
    this.addSelectOption(this.controlSelect, 'hold', 'Press and hold');

    const volumeRow = document.createElement('div');
    volumeRow.className = 'settings-overlay__row';
    volumeRow.append(volumeLabel, this.volumeSlider, this.volumeValue);

    const reducedRow = document.createElement('div');
    reducedRow.className = 'settings-overlay__row';
    reducedRow.append(reducedLabel, this.reducedMotionToggle);

    const themeRow = document.createElement('div');
    themeRow.className = 'settings-overlay__row';
    themeRow.append(themeLabel, this.themeSelect);

    const fpsRow = document.createElement('div');
    fpsRow.className = 'settings-overlay__row';
    fpsRow.append(fpsLabel, this.fpsSelect);

    const controlRow = document.createElement('div');
    controlRow.className = 'settings-overlay__row';
    controlRow.append(controlLabel, this.controlSelect);

    this.panel.append(
      this.closeButton,
      title,
      volumeRow,
      reducedRow,
      themeRow,
      fpsRow,
      controlRow
    );
    this.container.append(this.panel);
    appendToBody(this.container);
    appendToBody(this.launcherButton);
  }

  private addSelectOption(select: HTMLSelectElement, value: string, text: string): void {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    select.append(option);
  }

  public init(): void {
    this.bindEvents();
    this.syncUiWithSettings();
  }

  public Update(): void {
    // No-op – settings are managed via DOM events.
  }

  public Display(context: CanvasRenderingContext2D): void {
    if (!this.isOpen) return;

    context.save();
    context.fillStyle = 'rgba(0, 0, 0, 0.55)';
    context.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);
    context.restore();
  }

  private bindEvents(): void {
    this.closeButton.addEventListener('click', () => {
      this.game.navigateTo('intro');
    });

    this.container.addEventListener('click', (event) => {
      if (event.target === this.container) {
        this.game.navigateTo('intro');
      }
    });

    this.launcherButton.addEventListener('click', () => {
      this.game.navigateTo('settings');
    });

    this.volumeSlider.addEventListener('input', () => {
      const value = Number(this.volumeSlider.value) / 100;
      settings.set('volume', Math.min(VOLUME_MAX, Math.max(0, value)));
    });

    this.reducedMotionToggle.addEventListener('change', () => {
      settings.set('reducedMotion', this.reducedMotionToggle.checked);
    });

    this.themeSelect.addEventListener('change', () => {
      const value = this.themeSelect.value as 'system' | 'day' | 'night';
      settings.set('theme', value);
    });

    this.fpsSelect.addEventListener('change', () => {
      settings.set('fpsCap', Number(this.fpsSelect.value) as 0 | 30 | 60 | 120);
    });

    this.controlSelect.addEventListener('change', () => {
      settings.set('controlScheme', this.controlSelect.value as 'tap' | 'hold');
    });

    settings.subscribe('volume', (value) => {
      this.volumeSlider.value = String(Math.round(value * 100));
      this.volumeValue.textContent = `${Math.round(value * 100)}%`;
      Sfx.volume(value);
    });

    settings.subscribe('reducedMotion', (value) => {
      this.reducedMotionToggle.checked = value;
    });

    settings.subscribe('theme', () => {
      this.themeSelect.value = settings.get('theme');
      settings.applyThemeToDocument();
    });

    settings.subscribe('fpsCap', (value) => {
      this.fpsSelect.value = String(value);
      this.game.onFpsPreferenceChanged(value);
    });

    settings.subscribe('controlScheme', (value) => {
      this.controlSelect.value = value;
      this.game.onControlSchemeChanged(value);
    });
  }

  private syncUiWithSettings(): void {
    this.volumeSlider.value = String(Math.round(settings.get('volume') * 100));
    this.volumeValue.textContent = `${Math.round(settings.get('volume') * 100)}%`;
    this.reducedMotionToggle.checked = settings.get('reducedMotion');
    this.themeSelect.value = settings.get('theme');
    this.fpsSelect.value = String(settings.get('fpsCap'));
    this.controlSelect.value = settings.get('controlScheme');
    Sfx.volume(settings.get('volume'));
    settings.applyThemeToDocument();
    this.game.onFpsPreferenceChanged(settings.get('fpsCap'));
    this.game.onControlSchemeChanged(settings.get('controlScheme'));
  }

  public open(): void {
    if (this.isOpen) return;
    this.isOpen = true;
    this.container.hidden = false;
    window.setTimeout(() => {
      this.panel.focus({ preventScroll: true });
      this.closeButton.focus();
    });
  }

  public close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.container.hidden = true;
  }

  public showLauncher(): void {
    this.launcherButton.hidden = false;
  }

  public hideLauncher(): void {
    this.launcherButton.hidden = true;
  }
}
