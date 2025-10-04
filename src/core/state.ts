import { bus } from './event-bus';

const GAME_STATES = ['BOOT', 'READY', 'RUNNING', 'PAUSED', 'GAME_OVER'] as const;

export type GameStateValue = (typeof GAME_STATES)[number];

const ALLOWED_TRANSITIONS: Record<GameStateValue, readonly GameStateValue[]> = {
  BOOT: ['READY'],
  READY: ['RUNNING'],
  RUNNING: ['PAUSED', 'GAME_OVER'],
  PAUSED: ['RUNNING', 'GAME_OVER'],
  GAME_OVER: ['READY'],
};

const isValidState = (value: unknown): value is GameStateValue =>
  typeof value === 'string' && (GAME_STATES as readonly string[]).includes(value);

export interface GameStateMachine {
  getState(): GameStateValue;
  canTransition(target: GameStateValue): boolean;
  transition(target: GameStateValue): boolean;
  reset(): void;
}

export const createGameStateMachine = (
  initialState: GameStateValue = 'BOOT',
): GameStateMachine => {
  if (!isValidState(initialState)) {
    throw new Error(`Invalid initial game state: ${String(initialState)}`);
  }

  let currentState = initialState;
  const initial = initialState;

  const canTransition = (target: GameStateValue): boolean => {
    if (!isValidState(target)) {
      return false;
    }

    if (target === currentState) {
      return false;
    }

    const allowed = ALLOWED_TRANSITIONS[currentState];
    return allowed?.includes(target) ?? false;
  };

  const setState = (next: GameStateValue) => {
    const previous = currentState;
    currentState = next;
    bus.emit('game:state-change', { from: previous, to: next });
  };

  return {
    getState: () => currentState,
    canTransition,
    transition: (target) => {
      if (!canTransition(target)) {
        return false;
      }

      setState(target);
      return true;
    },
    reset: () => {
      if (currentState === initial) {
        return;
      }

      setState(initial);
    },
  } satisfies GameStateMachine;
};

declare global {
  interface GameEvents {
    'game:state-change': { from: GameStateValue; to: GameStateValue };
  }
}

export { GAME_STATES };
