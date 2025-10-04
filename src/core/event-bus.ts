import { emit, on } from './events';

export const bus = {
  on,
  emit,
} as const;

export type { GameEventName } from './events';
