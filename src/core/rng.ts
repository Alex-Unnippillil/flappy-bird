const TRUE_VALUES = new Set(["1", "true", "yes", "on", "enable", "enabled"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off", "disable", "disabled"]);

const DEFAULT_STORAGE_KEY = "flappy.seed" as const;

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export interface CreateRngOptions {
  storageKey?: string;
  storage?: StorageLike | null;
  now?: () => Date;
}

export interface Rng {
  /**
   * Current seed string that subsequent calls reset to.
   */
  getSeed(): string;
  /**
   * Reset the generator to the current seed.
   */
  reset(): void;
  /**
   * Replace the seed with a new value. When omitted, a new ISO timestamp is used.
   */
  reseed(seed?: string): string;
  /**
   * Generate a float in the range [0, 1).
   */
  nextFloat(): number;
  /**
   * Alias of `nextFloat()` for compatibility with existing callers.
   */
  next(): number;
  /**
   * Generate an integer within [min, max], inclusive.
   */
  int(min: number, max: number): number;
  /**
   * Alias of `int()` for compatibility with existing callers expecting `nextInt`.
   */
  nextInt(min: number, max: number): number;
}

const toBoolean = (value: unknown): boolean | null => {
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

const resolveStorage = (storage?: StorageLike | null): StorageLike | null => {
  if (storage !== undefined) {
    return storage ?? null;
  }

  if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
    return window.localStorage;
  }

  return null;
};

export const stringToUint32 = (seed: string): number => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const normalizeSeed = (seed: string | undefined, generateDefaultSeed: () => string): string => {
  if (typeof seed === "string") {
    const trimmed = seed.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }
  return generateDefaultSeed();
};

const readSeedFromStorage = (storage: StorageLike | null, storageKey: string): string | null => {
  if (!storage) {
    return null;
  }

  try {
    const stored = storage.getItem(storageKey);
    if (!stored) {
      return null;
    }
    return stored;
  } catch (_error) {
    return null;
  }
};

const persistSeed = (storage: StorageLike | null, storageKey: string, seed: string): void => {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(storageKey, seed);
  } catch (_error) {
    // Ignore persistence errors.
  }
};

const resolveNow = (now?: () => Date): (() => Date) => {
  if (typeof now === "function") {
    return now;
  }
  return () => new Date();
};

export const isRngFeatureEnabled = (): boolean => {
  const meta = import.meta as unknown as { env?: Record<string, unknown> };
  const value = meta.env?.VITE_FF_F04;
  const normalized = toBoolean(value);
  return normalized ?? false;
};

export function createRng(seed?: string, options: CreateRngOptions = {}): Rng {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
  const storage = resolveStorage(options.storage);
  const now = resolveNow(options.now);
  const defaultSeed = () => now().toISOString();

  const storedSeed = readSeedFromStorage(storage, storageKey);
  const initialSeed = normalizeSeed(seed ?? storedSeed ?? undefined, defaultSeed);
  let currentSeed = initialSeed;
  let state = stringToUint32(currentSeed);

  const saveIfNeeded = () => {
    persistSeed(storage, storageKey, currentSeed);
  };

  const nextFloat = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min: number, max: number): number => {
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      throw new Error("Bounds must be finite numbers");
    }

    if (!Number.isInteger(min) || !Number.isInteger(max)) {
      throw new Error("Bounds must be integers");
    }

    if (max < min) {
      throw new Error("max must be greater than or equal to min");
    }

    const range = max - min + 1;
    return Math.floor(nextFloat() * range) + min;
  };

  const reseed = (nextSeed?: string): string => {
    currentSeed = normalizeSeed(nextSeed, defaultSeed);
    state = stringToUint32(currentSeed);
    saveIfNeeded();
    return currentSeed;
  };

  // Persist the initial seed so subsequent sessions reuse it.
  saveIfNeeded();

  return {
    getSeed: () => currentSeed,
    reset: () => {
      state = stringToUint32(currentSeed);
    },
    reseed,
    nextFloat,
    next: nextFloat,
    int,
    nextInt: int,
  };
}

export default createRng;
