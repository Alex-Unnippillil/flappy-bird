// File Overview: This module belongs to src/lib/settings/ui.ts.
export type SettingsToggleHandler = (leftHanded: boolean) => void;

export default class SettingsPanel {
  private root: HTMLDivElement;
  private toggle: HTMLInputElement;
  private leftHanded: boolean;
  private mounted: boolean;
  private changeHandler?: SettingsToggleHandler;

  constructor() {
    this.root = document.createElement('div');
    this.root.id = 'settings-screen';
    this.toggle = document.createElement('input');
    this.leftHanded = false;
    this.mounted = false;
  }

  public mount(): void {
    if (this.mounted) return;

    const panel = document.createElement('div');
    panel.className = 'settings-panel';

    const title = document.createElement('span');
    title.className = 'settings-panel__title';
    title.textContent = 'Settings';

    const toggleWrapper = document.createElement('label');
    toggleWrapper.className = 'settings-panel__toggle';

    const label = document.createElement('span');
    label.textContent = 'Left-handed layout';

    this.toggle.type = 'checkbox';
    this.toggle.checked = this.leftHanded;
    this.toggle.setAttribute('aria-label', 'Toggle left-handed layout');

    this.toggle.addEventListener('change', () => {
      const isLeftHanded = this.toggle.checked;
      this.setLeftHanded(isLeftHanded);
      this.changeHandler?.(isLeftHanded);
    });

    toggleWrapper.append(this.toggle, label);
    panel.append(title, toggleWrapper);
    this.root.append(panel);
    document.body.appendChild(this.root);

    this.mounted = true;
    this.applyOrientation();
  }

  public setLeftHanded(leftHanded: boolean): void {
    this.leftHanded = leftHanded;

    if (this.mounted) {
      this.toggle.checked = leftHanded;
      this.applyOrientation();
    }
  }

  public onToggle(handler: SettingsToggleHandler): void {
    this.changeHandler = handler;
  }

  private applyOrientation(): void {
    if (!this.mounted) return;

    this.root.dataset.handed = this.leftHanded ? 'left' : 'right';
    document.body.dataset.handed = this.leftHanded ? 'left' : 'right';
  }
}
