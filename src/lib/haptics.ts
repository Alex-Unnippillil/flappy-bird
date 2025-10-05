// File Overview: This module belongs to src/lib/haptics.ts.
import Storage from './storage';

export type HapticPatternName = 'pipe' | 'collision' | 'pause';

export interface IHapticsState {
  supported: boolean;
  enabled: boolean;
  autoDisabled: boolean;
  userPreference: boolean;
}

interface IVibrationOptions {
  force?: boolean;
}

export default class Haptics {
  private static readonly STORAGE_KEY = 'haptics-enabled';
  private static readonly THROTTLE_MS = 180;
  private static readonly PATTERNS: Record<HapticPatternName, VibratePattern> = {
    pipe: [16, 40],
    collision: [0, 200, 70, 260],
    pause: [0, 60, 40, 60]
  };

  private static initialized = false;
  private static supported = false;
  private static autoDisabled = false;
  private static userPreference = false;
  private static lastVibration = 0;

  public static init(): void {
    if (Haptics.initialized) return;

    Haptics.initialized = true;
    Haptics.supported =
      typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const query = window.matchMedia('(prefers-reduced-motion: reduce)');
      Haptics.autoDisabled = query.matches;

      const handleChange = (event: MediaQueryListEvent) => {
        Haptics.autoDisabled = event.matches;
        Haptics.notify();
      };

      if (typeof query.addEventListener === 'function') {
        query.addEventListener('change', handleChange);
      } else if (typeof query.addListener === 'function') {
        // Deprecated but still required on Safari
        query.addListener(handleChange);
      }
    }

    const storedPreference = Storage.get(Haptics.STORAGE_KEY);
    if (typeof storedPreference === 'boolean') {
      Haptics.userPreference = storedPreference;
    } else {
      Haptics.userPreference = Haptics.supported && !Haptics.autoDisabled;
    }

    Haptics.notify();
  }

  public static get state(): IHapticsState {
    return {
      supported: Haptics.supported,
      enabled: Haptics.isEnabled(),
      autoDisabled: Haptics.autoDisabled,
      userPreference: Haptics.userPreference
    };
  }

  public static isEnabled(): boolean {
    return Haptics.supported && !Haptics.autoDisabled && Haptics.userPreference;
  }

  public static setUserPreference(enabled: boolean): void {
    if (!Haptics.supported) return;

    Haptics.userPreference = enabled;
    Storage.save(Haptics.STORAGE_KEY, enabled);
    Haptics.notify();
  }

  public static toggle(): boolean {
    const next = !Haptics.userPreference;
    Haptics.setUserPreference(next);
    return Haptics.isEnabled();
  }

  public static vibratePattern(
    name: HapticPatternName,
    options: IVibrationOptions = {}
  ): boolean {
    const pattern = Haptics.PATTERNS[name];
    return Haptics.vibrate(pattern, options);
  }

  private static vibrate(pattern: VibratePattern, { force = false }: IVibrationOptions): boolean {
    if (!Haptics.isEnabled()) return false;

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (!force && now - Haptics.lastVibration < Haptics.THROTTLE_MS) {
      return false;
    }

    Haptics.lastVibration = now;

    try {
      if (typeof navigator.vibrate !== 'function') {
        return false;
      }

      return navigator.vibrate(pattern);
    } catch (err) {
      console.warn('Unable to trigger vibration', err);
      return false;
    }
  }

  private static notify(): void {
    // Reset the throttle timer when disabling to ensure immediate feedback later
    if (!Haptics.isEnabled()) {
      Haptics.lastVibration = 0;
    }
  }
}
