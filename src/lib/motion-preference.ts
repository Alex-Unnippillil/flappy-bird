// File Overview: This module belongs to src/lib/motion-preference.ts.
import Storage from './storage';

export type MotionPreferenceMode = 'auto' | 'reduce' | 'no-preference';
export type MotionPreferenceSource = 'manual' | 'system';

export interface MotionPreferenceState {
  mode: MotionPreferenceMode;
  reduceMotion: boolean;
  source: MotionPreferenceSource;
}

type MotionPreferenceListener = (state: MotionPreferenceState) => void;

type MediaQueryChangeHandler = (event: MediaQueryListEvent) => void;

export default class MotionPreference {
  private static readonly STORAGE_KEY = 'reduced-motion-preference';
  private static initialized = false;
  private static mode: MotionPreferenceMode = 'auto';
  private static listeners: Set<MotionPreferenceListener> = new Set<MotionPreferenceListener>();
  private static mediaQuery: MediaQueryList | null = null;

  private static ensureInit(): void {
    if (MotionPreference.initialized) return;
    MotionPreference.initialized = true;

    try {
      new Storage();
    } catch (err) {
      // Storage initialization errors are non-critical; we fallback to memory state.
    }

    const stored = Storage.get(MotionPreference.STORAGE_KEY);
    if (
      stored === 'reduce' ||
      stored === 'no-preference' ||
      stored === 'auto'
    ) {
      MotionPreference.mode = stored;
    }

    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      MotionPreference.mediaQuery = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      );

      const handler: MediaQueryChangeHandler = () => {
        if (MotionPreference.mode === 'auto') {
          MotionPreference.notify();
        }
      };

      try {
        MotionPreference.mediaQuery.addEventListener('change', handler);
      } catch (err) {
        if ('addListener' in MotionPreference.mediaQuery) {
          MotionPreference.mediaQuery.addListener(handler);
        }
      }
    }
  }

  public static subscribe(listener: MotionPreferenceListener): () => void {
    MotionPreference.ensureInit();
    MotionPreference.listeners.add(listener);
    listener(MotionPreference.getState());

    return () => {
      MotionPreference.listeners.delete(listener);
    };
  }

  public static shouldReduceMotion(): boolean {
    return MotionPreference.getState().reduceMotion;
  }

  public static getState(): MotionPreferenceState {
    MotionPreference.ensureInit();

    const reduceMotion =
      MotionPreference.mode === 'auto'
        ? MotionPreference.mediaQuery?.matches ?? false
        : MotionPreference.mode === 'reduce';

    return {
      mode: MotionPreference.mode,
      reduceMotion,
      source: MotionPreference.mode === 'auto' ? 'system' : 'manual'
    };
  }

  public static toggle(): void {
    MotionPreference.ensureInit();

    if (MotionPreference.mode === 'auto') {
      MotionPreference.setMode('reduce');
    } else if (MotionPreference.mode === 'reduce') {
      MotionPreference.setMode('no-preference');
    } else {
      MotionPreference.setMode('auto');
    }
  }

  public static setMode(mode: MotionPreferenceMode): void {
    MotionPreference.ensureInit();

    if (MotionPreference.mode === mode) return;

    MotionPreference.mode = mode;
    Storage.save(MotionPreference.STORAGE_KEY, mode);
    MotionPreference.notify();
  }

  private static notify(): void {
    const state = MotionPreference.getState();
    MotionPreference.listeners.forEach((listener: MotionPreferenceListener) => {
      listener(state);
    });
  }
}
