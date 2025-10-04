import { createDeterministicPrng, type DeterministicPRNG } from "@/game/systems/prng";

export const F05_SETTINGS_EVENT = "feature:F05/settings:update" as const;
export const F05_FLAG_STORAGE_KEY = "feature:F05/settings:flag" as const;
export const F05_SETTINGS_STORAGE_KEY = "feature:F05/settings:data" as const;
const FEATURE_FLAG_KEY = "VITE_FF_F05" as const;

const TRUE_VALUES = new Set(["1", "true", "yes", "on", "enable", "enabled"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off", "disable", "disabled"]);

export interface FeatureF05SettingsUpdateDetail {
  settings: Record<string, unknown>;
}

export interface RegisterF05Options {
  env?: Record<string, unknown>;
  storage?: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null;
  eventTarget?: Pick<EventTarget, "dispatchEvent"> | null;
}

export interface F05SettingsContext {
  /**
   * Combined settings sourced from `import.meta.env` and persisted local overrides.
   * Local values override their environment counterparts.
   */
  settings: Record<string, unknown>;
  /**
   * Deterministic pseudo-random number generator seeded from the context.
   */
  prng: DeterministicPRNG;
  /**
   * Convenience helper mapped to `prng.next()` to generate deterministic values.
   */
  random(): number;
  /**
   * Applies local overrides to the settings bag, updates persisted storage, and
   * dispatches a `feature:F05/settings:update` event.
   */
  update(patch: Record<string, unknown>): Record<string, unknown>;
}

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type PlainObject = Record<string, unknown>;

type EventDispatcher = Pick<EventTarget, "dispatchEvent">;

const resolveEnv = (env?: PlainObject): PlainObject => {
  if (env) {
    return { ...env };
  }

  const meta = import.meta as unknown as { env?: PlainObject };
  return { ...(meta.env ?? {}) };
};

const resolveStorage = (storage?: StorageLike | null): StorageLike | null => {
  if (storage !== undefined) {
    return storage ?? null;
  }

  if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
    return window.localStorage;
  }

  return null;
};

const resolveEventTarget = (eventTarget?: EventDispatcher | null): EventDispatcher | null => {
  if (eventTarget !== undefined) {
    return eventTarget ?? null;
  }

  if (typeof window !== "undefined") {
    return window;
  }

  return null;
};

const toPlainObject = (value: unknown): PlainObject => {
  if (!value || typeof value !== "object") {
    return {};
  }

  if (Array.isArray(value)) {
    return {};
  }

  return value as PlainObject;
};

const normalizeBoolean = (value: unknown): boolean | null => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (TRUE_VALUES.has(normalized)) {
      return true;
    }
    if (FALSE_VALUES.has(normalized)) {
      return false;
    }
  }

  return null;
};

const readBooleanFromStorage = (storage: StorageLike | null, key: string): boolean | null => {
  if (!storage) {
    return null;
  }

  const value = storage.getItem(key);
  if (value === null) {
    return null;
  }

  return normalizeBoolean(value);
};

const extractSeed = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value >>> 0;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return parsed >>> 0;
    }
  }

  return null;
};

const readSettingsFromStorage = (storage: StorageLike | null): PlainObject => {
  if (!storage) {
    return {};
  }

  const raw = storage.getItem(F05_SETTINGS_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    return toPlainObject(parsed);
  } catch (error) {
    return {};
  }
};

const persistSettings = (storage: StorageLike | null, settings: PlainObject): void => {
  if (!storage) {
    return;
  }

  try {
    if (Object.keys(settings).length === 0) {
      storage.removeItem(F05_SETTINGS_STORAGE_KEY);
      return;
    }

    storage.setItem(F05_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    // Ignore storage write failures (e.g., quota exceeded or disabled storage).
  }
};

const cloneSettings = (settings: PlainObject): PlainObject => ({ ...settings });

const computeSeed = (
  localSettings: PlainObject,
  envSettings: PlainObject,
  fallbackSeed: number,
): number => {
  const localSeed = extractSeed(localSettings.seed);
  if (localSeed !== null) {
    return localSeed;
  }

  const envSeed =
    extractSeed(envSettings.seed) ??
    extractSeed(envSettings.VITE_F05_SEED) ??
    extractSeed(envSettings.F05_SEED);
  if (envSeed !== null) {
    return envSeed;
  }

  return fallbackSeed >>> 0;
};

const shouldEnableFeature = (
  envSettings: PlainObject,
  storage: StorageLike | null,
): boolean => {
  const override = readBooleanFromStorage(storage, F05_FLAG_STORAGE_KEY);
  if (override !== null) {
    return override;
  }

  const envValue = envSettings[FEATURE_FLAG_KEY];
  const normalized = normalizeBoolean(envValue);
  if (normalized !== null) {
    return normalized;
  }

  return false;
};

const normalizePatch = (patch: Record<string, unknown>): PlainObject => {
  const normalized = toPlainObject(patch);
  return { ...normalized };
};

export const registerF05SettingsContext = (
  options: RegisterF05Options = {},
): F05SettingsContext | null => {
  const envSettings = resolveEnv(options.env);
  const storage = resolveStorage(options.storage);
  const eventTarget = resolveEventTarget(options.eventTarget);

  if (!shouldEnableFeature(envSettings, storage)) {
    return null;
  }

  const storedSettings = readSettingsFromStorage(storage);
  let localSettings = cloneSettings(storedSettings);
  const mergedSettings = { ...envSettings, ...localSettings } as PlainObject;

  let currentSeed = computeSeed(localSettings, envSettings, Date.now());

  if (localSettings.seed === undefined) {
    localSettings = { ...localSettings, seed: currentSeed };
  } else {
    localSettings.seed = currentSeed;
  }

  mergedSettings.seed = currentSeed;

  const prng = createDeterministicPrng({
    seed: currentSeed,
    storage: null,
    autoLoad: false,
    autoSave: false,
  });

  const emitUpdate = (settings: PlainObject) => {
    if (!eventTarget) {
      return;
    }

    eventTarget.dispatchEvent(
      new CustomEvent<FeatureF05SettingsUpdateDetail>(F05_SETTINGS_EVENT, {
        detail: { settings: cloneSettings(settings) },
      }),
    );
  };

  const persistIfNeeded = (nextSettings: PlainObject) => {
    persistSettings(storage, nextSettings);
  };

  const context: F05SettingsContext = {
    settings: mergedSettings,
    prng,
    random: () => prng.next(),
    update: (patch: Record<string, unknown>) => {
      const normalizedPatch = normalizePatch(patch);
      let nextLocal = { ...localSettings };
      let nextSettings = { ...context.settings };

      const keys = Object.keys(normalizedPatch);
      if (keys.length === 0) {
        return cloneSettings(nextSettings);
      }

      let changed = false;

      for (const key of keys) {
        const value = normalizedPatch[key];
        if (value === undefined) {
          if (key in nextLocal) {
            delete nextLocal[key];
            changed = true;
          }

          if (key in envSettings) {
            if (nextSettings[key] !== envSettings[key]) {
              nextSettings[key] = envSettings[key];
              changed = true;
            }
          } else if (key in nextSettings) {
            delete nextSettings[key];
            changed = true;
          }

          continue;
        }

        if (nextLocal[key] !== value) {
          nextLocal[key] = value;
          changed = true;
        }

        if (nextSettings[key] !== value) {
          nextSettings[key] = value;
          changed = true;
        }
      }

      const nextSeed = computeSeed(nextLocal, envSettings, currentSeed);
      if (nextSeed !== currentSeed) {
        currentSeed = nextSeed;
        prng.seed(currentSeed);
        changed = true;
      }

      nextLocal.seed = currentSeed;
      nextSettings.seed = currentSeed;

      if (!changed) {
        return cloneSettings(context.settings);
      }

      localSettings = nextLocal;
      context.settings = nextSettings;

      persistIfNeeded(localSettings);
      emitUpdate(context.settings);

      return cloneSettings(context.settings);
    },
  };

  persistIfNeeded(localSettings);

  return context;
};

export default registerF05SettingsContext;
