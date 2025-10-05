// File Overview: This module belongs to src/lib/settings/motion.ts.
import Storage from '../storage';

export type MotionPreference = 'system' | 'reduce' | 'full';

export interface MotionPreferenceState {
  preference: MotionPreference;
  systemPrefersReduced: boolean;
  reduceMotion: boolean;
}

export type MotionPreferenceListener = (state: MotionPreferenceState) => void;

export default class MotionSettings {
  private static readonly storageKey = 'motion-preference';
  private static preference: MotionPreference = 'system';
  private static systemMediaQuery: MediaQueryList | undefined;
  private static systemPrefersReduced = false;
  private static initialized = false;
  private static listeners = new Set<MotionPreferenceListener>();

  private static ensureInit(): void {
    if (MotionSettings.initialized) return;
    MotionSettings.initialized = true;

    new Storage();

    MotionSettings.systemMediaQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );
    MotionSettings.systemPrefersReduced = MotionSettings.systemMediaQuery.matches;

    const savedPreference = Storage.get(MotionSettings.storageKey);
    if (
      savedPreference === 'system' ||
      savedPreference === 'reduce' ||
      savedPreference === 'full'
    ) {
      MotionSettings.preference = savedPreference;
    }

    const handleChange = (event: MediaQueryListEvent): void => {
      MotionSettings.systemPrefersReduced = event.matches;
      MotionSettings.emit();
    };

    if (typeof MotionSettings.systemMediaQuery.addEventListener === 'function') {
      MotionSettings.systemMediaQuery.addEventListener('change', handleChange);
    } else if (
      typeof MotionSettings.systemMediaQuery.addListener === 'function'
    ) {
      MotionSettings.systemMediaQuery.addListener(handleChange);
    }
  }

  private static emit(): void {
    const state = MotionSettings.getState();
    MotionSettings.listeners.forEach((listener) => listener(state));
  }

  public static getState(): MotionPreferenceState {
    MotionSettings.ensureInit();
    return {
      preference: MotionSettings.preference,
      systemPrefersReduced: MotionSettings.systemPrefersReduced,
      reduceMotion: MotionSettings.shouldReduceMotion()
    };
  }

  public static subscribe(listener: MotionPreferenceListener): () => void {
    MotionSettings.ensureInit();
    MotionSettings.listeners.add(listener);
    listener(MotionSettings.getState());
    return () => {
      MotionSettings.listeners.delete(listener);
    };
  }

  public static setPreference(preference: MotionPreference): void {
    MotionSettings.ensureInit();

    if (MotionSettings.preference === preference) {
      MotionSettings.emit();
      return;
    }

    MotionSettings.preference = preference;
    Storage.save(MotionSettings.storageKey, preference);
    MotionSettings.emit();
  }

  public static shouldReduceMotion(): boolean {
    MotionSettings.ensureInit();

    if (MotionSettings.preference === 'reduce') {
      return true;
    }

    if (MotionSettings.preference === 'full') {
      return false;
    }

    return MotionSettings.systemPrefersReduced;
  }
}
