// File Overview: This module belongs to src/lib/settings/control-mode.ts.
import Storage from '../storage';

export type ControlMode = 'tap' | 'hold';

const STORAGE_KEY = 'control-mode';
export const DEFAULT_CONTROL_MODE: ControlMode = 'tap';

type ControlModeListener = (mode: ControlMode) => void;

const listeners = new Set<ControlModeListener>();
let cachedMode: ControlMode | null = null;

const readFromStorage = (): ControlMode => {
  const stored = Storage.get(STORAGE_KEY);

  if (stored === 'hold' || stored === 'tap') {
    return stored;
  }

  return DEFAULT_CONTROL_MODE;
};

const notify = (mode: ControlMode): void => {
  listeners.forEach((listener) => {
    listener(mode);
  });
};

export const getControlMode = (): ControlMode => {
  const mode = readFromStorage();

  if (cachedMode !== mode) {
    cachedMode = mode;
  }

  return cachedMode!;
};

export const setControlMode = (mode: ControlMode): void => {
  if (cachedMode === mode) {
    Storage.save(STORAGE_KEY, mode);
    return;
  }

  cachedMode = mode;
  Storage.save(STORAGE_KEY, mode);
  notify(mode);
};

export const toggleControlMode = (): ControlMode => {
  const nextMode: ControlMode = getControlMode() === 'tap' ? 'hold' : 'tap';
  setControlMode(nextMode);
  return nextMode;
};

export const subscribeControlMode = (
  listener: ControlModeListener
): (() => void) => {
  listeners.add(listener);
  listener(getControlMode());

  return () => {
    listeners.delete(listener);
  };
};
