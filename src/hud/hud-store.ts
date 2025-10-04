export type HudPreferenceKey = "audioEnabled";

export interface HudPreferences {
  audioEnabled: boolean;
}

const STORAGE_KEY = "flappy-hud-preferences";
const DEFAULT_PREFERENCES: HudPreferences = {
  audioEnabled: true,
};

let cachedPreferences: HudPreferences | null = null;
const listeners = new Set<(prefs: HudPreferences) => void>();

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch (_error) {
    return null;
  }
}

function loadFromStorage(): HudPreferences {
  const storage = getStorage();
  if (!storage) {
    return { ...DEFAULT_PREFERENCES };
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_PREFERENCES };
    }

    const parsed = JSON.parse(raw) as Partial<HudPreferences> | null;
    if (!parsed || typeof parsed !== "object") {
      return { ...DEFAULT_PREFERENCES };
    }

    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
    };
  } catch (_error) {
    return { ...DEFAULT_PREFERENCES };
  }
}

function persistPreferences(preferences: HudPreferences): void {
  const storage = getStorage();
  if (!storage) {
    cachedPreferences = { ...preferences };
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (_error) {
    // Ignore storage failures to keep the HUD responsive even when storage is unavailable.
  }

  cachedPreferences = { ...preferences };
}

function getCachedPreferences(): HudPreferences {
  if (!cachedPreferences) {
    cachedPreferences = loadFromStorage();
  }

  return cachedPreferences;
}

function notifyListeners(preferences: HudPreferences): void {
  listeners.forEach((listener) => {
    listener({ ...preferences });
  });
}

export function getHudPreferences(): HudPreferences {
  return { ...getCachedPreferences() };
}

export function getHudPreference<K extends HudPreferenceKey>(
  key: K,
): HudPreferences[K] {
  const preferences = getCachedPreferences();
  return preferences[key];
}

export function setHudPreference<K extends HudPreferenceKey>(
  key: K,
  value: HudPreferences[K],
): HudPreferences {
  const current = getCachedPreferences();
  if (current[key] === value) {
    return { ...current };
  }

  const next: HudPreferences = {
    ...current,
    [key]: value,
  };

  persistPreferences(next);
  notifyListeners(next);
  return { ...next };
}

export function subscribeToHudPreferences(
  listener: (preferences: HudPreferences) => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resetHudPreferences(): HudPreferences {
  const defaults = { ...DEFAULT_PREFERENCES };
  cachedPreferences = defaults;
  const storage = getStorage();
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch (_error) {
    // Ignore failures when clearing storage.
  }
  notifyListeners(defaults);
  return { ...defaults };
}
