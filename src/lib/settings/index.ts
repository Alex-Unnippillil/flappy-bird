// File Overview: This module belongs to src/lib/settings/index.ts.
import Storage from '../storage';

export interface ISettingsState {
  leftHanded: boolean;
}

type SettingsListener = (state: ISettingsState) => void;

class SettingsManager {
  private state: ISettingsState;
  private listeners: Set<SettingsListener>;
  private isReady: boolean;

  constructor() {
    this.state = { leftHanded: false };
    this.listeners = new Set();
    this.isReady = false;
  }

  public init(): void {
    if (this.isReady) return;

    // Ensure localStorage availability before reading.
    new Storage();

    const storedLeftHanded = Storage.get('setting-left-handed');

    this.state.leftHanded = typeof storedLeftHanded === 'boolean' ? storedLeftHanded : false;
    this.isReady = true;
    this.notify();
  }

  public get value(): ISettingsState {
    return { ...this.state };
  }

  public onChange(listener: SettingsListener): IEmptyFunction {
    this.listeners.add(listener);

    if (this.isReady) {
      listener(this.value);
    }

    return () => {
      this.listeners.delete(listener);
    };
  }

  public setLeftHanded(enabled: boolean): void {
    if (this.state.leftHanded === enabled) return;

    this.state.leftHanded = enabled;
    if (this.isReady) {
      Storage.save('setting-left-handed', enabled);
      this.notify();
    }
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      listener(this.value);
    });
  }
}

const Settings = new SettingsManager();

export default Settings;
