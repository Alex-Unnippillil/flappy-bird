// File Overview: This module belongs to src/lib/settings/index.ts.
import Storage, { type IStoreValue } from '../storage';

type ThemeSetting = 'system' | 'day' | 'night';
type ControlScheme = 'tap' | 'hold';

type FpsCapOption = 0 | 30 | 60 | 120;

export interface ISettingsState {
  volume: number;
  reducedMotion: boolean;
  theme: ThemeSetting;
  fpsCap: FpsCapOption;
  controlScheme: ControlScheme;
}

export type SettingsKey = keyof ISettingsState;
export type SettingsListener<T extends SettingsKey = SettingsKey> = (
  value: ISettingsState[T]
) => void;

const STORAGE_KEYS: Record<SettingsKey, string> = {
  volume: 'settings.volume',
  reducedMotion: 'settings.reducedMotion',
  theme: 'settings.theme',
  fpsCap: 'settings.fpsCap',
  controlScheme: 'settings.controlScheme'
};

const DEFAULT_STATE: ISettingsState = {
  volume: 0.6,
  reducedMotion: false,
  theme: 'system',
  fpsCap: 60,
  controlScheme: 'tap'
};

export default class SettingsManager {
  private static instance: SettingsManager;
  private state: ISettingsState;
  private listeners: Map<SettingsKey, Set<SettingsListener>>;
  private systemThemeMatcher?: MediaQueryList;

  private constructor() {
    new Storage();
    this.listeners = new Map();
    this.state = { ...DEFAULT_STATE };
    this.loadInitialState();
    this.setupThemeListener();
  }

  private loadInitialState(): void {
    (Object.keys(DEFAULT_STATE) as SettingsKey[]).forEach((key) => {
      const stored = Storage.get(STORAGE_KEYS[key]);

      if (stored === undefined) {
        return;
      }

      switch (key) {
        case 'volume':
          this.state.volume = Math.min(1, Math.max(0, Number(stored)));
          break;
        case 'reducedMotion':
          this.state.reducedMotion = stored === true || stored === 'true';
          break;
        case 'theme':
          if (stored === 'day' || stored === 'night' || stored === 'system') {
            this.state.theme = stored;
          }
          break;
        case 'fpsCap':
          this.state.fpsCap = this.parseFpsCap(stored);
          break;
        case 'controlScheme':
          if (stored === 'tap' || stored === 'hold') {
            this.state.controlScheme = stored;
          }
          break;
        default:
          break;
      }
    });
  }

  private parseFpsCap(value: IStoreValue): FpsCapOption {
    const numeric = Number(value);

    if (numeric === 30 || numeric === 60 || numeric === 120) {
      return numeric;
    }

    return 0;
  }

  public static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }

    return SettingsManager.instance;
  }

  public get<K extends SettingsKey>(key: K): ISettingsState[K] {
    return this.state[key];
  }

  public set<K extends SettingsKey>(key: K, value: ISettingsState[K]): void {
    if (this.state[key] === value) return;

    this.state = { ...this.state, [key]: value } as ISettingsState;
    this.persist(key, value);
    this.emit(key, value);
  }

  private persist<K extends SettingsKey>(key: K, value: ISettingsState[K]): void {
    switch (key) {
      case 'volume':
        Storage.save(STORAGE_KEYS[key], Number(value));
        break;
      case 'reducedMotion':
        Storage.save(STORAGE_KEYS[key], Boolean(value));
        break;
      case 'theme':
        Storage.save(STORAGE_KEYS[key], String(value));
        break;
      case 'fpsCap':
        Storage.save(STORAGE_KEYS[key], Number(value));
        break;
      case 'controlScheme':
        Storage.save(STORAGE_KEYS[key], String(value));
        break;
      default:
        break;
    }
  }

  private emit<K extends SettingsKey>(key: K, value: ISettingsState[K]): void {
    const listeners = this.listeners.get(key);
    if (!listeners) return;

    listeners.forEach((listener) => {
      listener(value);
    });
  }

  public subscribe<K extends SettingsKey>(
    key: K,
    listener: SettingsListener<K>
  ): () => void {
    const listeners = this.listeners.get(key) ?? new Set();
    listeners.add(listener as SettingsListener);
    this.listeners.set(key, listeners);

    return () => {
      const existing = this.listeners.get(key);
      existing?.delete(listener as SettingsListener);
      if (existing && existing.size < 1) {
        this.listeners.delete(key);
      }
    };
  }

  public get motionScale(): number {
    return this.state.reducedMotion ? 0.6 : 1;
  }

  public applyThemeToDocument(): void {
    const root = document.documentElement;
    root.classList.remove('theme-day', 'theme-night');

    if (this.state.theme === 'day') {
      root.classList.add('theme-day');
      return;
    }

    if (this.state.theme === 'night') {
      root.classList.add('theme-night');
      return;
    }

    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    root.classList.add(prefersDark ? 'theme-night' : 'theme-day');
  }

  private setupThemeListener(): void {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    this.systemThemeMatcher = window.matchMedia('(prefers-color-scheme: dark)');

    this.systemThemeMatcher.addEventListener('change', () => {
      if (this.state.theme === 'system') {
        this.applyThemeToDocument();
      }
    });
  }
}

export const settings = SettingsManager.getInstance();
export type { ThemeSetting, ControlScheme, FpsCapOption };
