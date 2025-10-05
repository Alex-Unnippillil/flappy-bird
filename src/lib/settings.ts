// File Overview: This module belongs to src/lib/settings.ts.
import Storage from './storage';

export const FPS_OPTIONS = [30, 60, 120] as const;
export type IFpsCap = (typeof FPS_OPTIONS)[number];

const STORAGE_KEY = 'fps-cap';
const DEFAULT_CAP: IFpsCap = 60;

type IFpsListener = (fps: IFpsCap) => void;

let cachedCap: IFpsCap = DEFAULT_CAP;
const listeners = new Set<IFpsListener>();

const ensureStorage = () => {
  // Instantiating Storage configures static availability checks.
  new Storage();
};

const isValidCap = (value: unknown): value is IFpsCap => {
  for (const option of FPS_OPTIONS) {
    if (option === value) return true;
  }

  return false;
};

const notify = (fps: IFpsCap) => {
  for (const handler of Array.from(listeners.values())) {
    handler(fps);
  }
};

export const loadFpsCap = (): IFpsCap => {
  ensureStorage();

  const stored = Storage.get(STORAGE_KEY);

  if (isValidCap(stored)) {
    cachedCap = stored;
    return cachedCap;
  }

  cachedCap = DEFAULT_CAP;
  return cachedCap;
};

export const getFpsCap = (): IFpsCap => cachedCap;

export const setFpsCap = (fps: IFpsCap): void => {
  if (!isValidCap(fps)) return;

  ensureStorage();

  if (cachedCap === fps) return;

  cachedCap = fps;
  Storage.save(STORAGE_KEY, fps);
  notify(cachedCap);
};

export const onFpsCapChange = (listener: IFpsListener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const resetFpsCap = (): void => {
  cachedCap = DEFAULT_CAP;
  notify(cachedCap);
};

export const getDefaultFpsCap = (): IFpsCap => DEFAULT_CAP;
