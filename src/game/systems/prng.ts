const DEFAULT_STORAGE_KEY = "flappy-bird/prng-seed";

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
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

export class DeterministicPRNG {
  private state: number;

  private initialSeed: number;

  private readonly storageKey: string;

  constructor(seed: number = Date.now(), storageKey: string = DEFAULT_STORAGE_KEY) {
    this.storageKey = storageKey;
    this.initialSeed = 0;
    this.state = 0;
    this.seed(seed);
  }

  seed(seed: number): number {
    const normalized = seed >>> 0;
    this.initialSeed = normalized;
    this.state = normalized;
    return this.initialSeed;
  }

  reset(): void {
    this.state = this.initialSeed;
  }

  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    if (max < min) {
      throw new Error("max must be greater than or equal to min");
    }

    const range = max - min + 1;
    return Math.floor(this.next() * range) + min;
  }

  getSeed(): number {
    return this.initialSeed;
  }

  serializeSeed(): string {
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

    const parsed = Number.parseInt(storedValue, 10);
    if (Number.isNaN(parsed)) {
      return false;
    }

    this.seed(parsed);
    return true;
  }
}

export interface CreatePrngOptions {
  seed?: number;
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

  const prng = new DeterministicPRNG(seed, storageKey);
  const resolvedStorage = resolveStorage(storage);

  const loaded = autoLoad ? prng.loadSeed(resolvedStorage) : false;
  if (!loaded && autoSave && resolvedStorage) {
    prng.saveSeed(resolvedStorage);
  }

  return prng;
}

export function setDeterministicSeed(seed: number, storage?: StorageAdapter | null, storageKey: string = DEFAULT_STORAGE_KEY): number {
  const prng = new DeterministicPRNG(seed, storageKey);
  prng.saveSeed(storage);
  return prng.getSeed();
}
