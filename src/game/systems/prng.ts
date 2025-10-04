import { createRng, isRngFeatureEnabled, stringToUint32 } from '../../core/rng';

const LEGACY_STORAGE_KEY = "flappy-bird/prng-seed" as const;
const MODERN_STORAGE_KEY = "flappy.seed" as const;
const DEFAULT_STORAGE_KEY = isRngFeatureEnabled()
  ? MODERN_STORAGE_KEY
  : LEGACY_STORAGE_KEY;

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function resolveStorage(storage?: StorageAdapter | null): StorageAdapter | null {
  if (storage) {
    return storage;
  }

  if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
    return window.localStorage;
  }

  return null;
}

const normalizeSeedInput = (seed?: number | string): string | undefined => {
  if (typeof seed === "string") {
    return seed;
  }

  if (typeof seed === "number" && Number.isFinite(seed)) {
    return String(seed >>> 0);
  }

  return undefined;
};

export class DeterministicPRNG {
  private state: number;

  private initialSeed: number;

  private readonly storageKey: string;

  private readonly delegate: ReturnType<typeof createRng> | null;

  constructor(
    seed: number | string = Date.now(),
    storageKey: string = DEFAULT_STORAGE_KEY,
    storage?: StorageAdapter | null,
  ) {
    this.storageKey = storageKey;
    this.initialSeed = 0;
    this.state = 0;

    if (isRngFeatureEnabled()) {
      const delegateStorage = resolveStorage(storage);
      this.delegate = createRng(normalizeSeedInput(seed), {
        storageKey,
        storage: delegateStorage,
      });
      const activeSeed = this.delegate.getSeed();
      this.initialSeed = stringToUint32(activeSeed);
      this.state = this.initialSeed;
    } else {
      this.delegate = null;
      this.seed(seed);
    }
  }

  seed(seed?: number | string): number {
    if (this.delegate) {
      const nextSeed = this.delegate.reseed(normalizeSeedInput(seed));
      this.initialSeed = stringToUint32(nextSeed);
      this.state = this.initialSeed;
      return this.initialSeed;
    }

    const numericSeed = (() => {
      if (typeof seed === "number" && Number.isFinite(seed)) {
        return seed;
      }
      if (typeof seed === "string") {
        const parsed = Number.parseInt(seed, 10);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
      return Date.now();
    })();

    const normalized = numericSeed >>> 0;
    this.initialSeed = normalized;
    this.state = normalized;
    return this.initialSeed;
  }

  reset(): void {
    if (this.delegate) {
      this.delegate.reset();
      this.state = stringToUint32(this.delegate.getSeed());
      return;
    }

    this.state = this.initialSeed;
  }

  next(): number {
    if (this.delegate) {
      return this.delegate.nextFloat();
    }

    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    if (this.delegate) {
      return this.delegate.int(min, max);
    }

    if (max < min) {
      throw new Error("max must be greater than or equal to min");
    }

    const range = max - min + 1;
    return Math.floor(this.next() * range) + min;
  }

  getSeed(): number {
    if (this.delegate) {
      return stringToUint32(this.delegate.getSeed());
    }

    return this.initialSeed;
  }

  serializeSeed(): string {
    if (this.delegate) {
      return this.delegate.getSeed();
    }

    return this.initialSeed.toString(10);
  }

  saveSeed(storage?: StorageAdapter | null): void {
    const resolvedStorage = resolveStorage(storage);
    if (!resolvedStorage) {
      return;
    }

    resolvedStorage.setItem(this.storageKey, this.serializeSeed());
  }

  loadSeed(storage?: StorageAdapter | null): boolean {
    const resolvedStorage = resolveStorage(storage);
    if (!resolvedStorage) {
      return false;
    }

    const storedValue = resolvedStorage.getItem(this.storageKey);
    if (storedValue === null) {
      return false;
    }

    if (this.delegate) {
      this.delegate.reseed(storedValue);
      this.state = stringToUint32(this.delegate.getSeed());
      this.initialSeed = this.state;
      return true;
    }

    const parsed = Number.parseInt(storedValue, 10);
    if (Number.isNaN(parsed)) {
      return false;
    }

    this.seed(parsed);
    return true;
  }
}

export interface CreatePrngOptions {
  seed?: number | string;
  storageKey?: string;
  storage?: StorageAdapter | null;
  autoLoad?: boolean;
  autoSave?: boolean;
}

export function createDeterministicPrng(options: CreatePrngOptions = {}): DeterministicPRNG {
  const {
    seed = Date.now(),
    storageKey = DEFAULT_STORAGE_KEY,
    storage = undefined,
    autoLoad = true,
    autoSave = true,
  } = options;

  const resolvedStorage = resolveStorage(storage);
  const prng = new DeterministicPRNG(seed, storageKey, resolvedStorage);

  const loaded = autoLoad ? prng.loadSeed(resolvedStorage) : false;
  if (!loaded && autoSave && resolvedStorage) {
    prng.saveSeed(resolvedStorage);
  }

  return prng;
}

export function setDeterministicSeed(
  seed: number | string,
  storage?: StorageAdapter | null,
  storageKey: string = DEFAULT_STORAGE_KEY,
): number {
  const resolvedStorage = resolveStorage(storage);
  const prng = new DeterministicPRNG(seed, storageKey, resolvedStorage);
  prng.saveSeed(resolvedStorage);
  return prng.getSeed();
}
