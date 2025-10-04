import { bus } from './event-bus';
import type { GameStateMachine, GameStateValue } from './state';

const FEATURE_FLAG_KEY = 'VITE_FF_F03';
const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on', 'enable', 'enabled']);
const FALSE_VALUES = new Set(['0', 'false', 'no', 'off', 'disable', 'disabled']);

export const FIXED_TIME_STEP = 1 / 60;
const DEFAULT_MAX_DELTA = 0.25;
const DEFAULT_MAX_STEPS = 5;
const STEP_EPSILON = 1e-9;

export interface FrameScheduler {
  request(callback: FrameRequestCallback): number;
  cancel(handle: number): void;
}

export interface GameLoopOptions {
  state: Pick<GameStateMachine, 'getState'>;
  scheduler?: FrameScheduler | null;
  env?: Record<string, unknown>;
  maxDelta?: number;
  maxSubSteps?: number;
}

export interface GameLoopController {
  start(): void;
  stop(): void;
  isRunning(): boolean;
}

const normalizeBoolean = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (TRUE_VALUES.has(normalized)) return true;
    if (FALSE_VALUES.has(normalized)) return false;
  }

  return null;
};

const resolveEnv = (env?: Record<string, unknown>): Record<string, unknown> => {
  if (env) {
    return env;
  }

  const meta = import.meta as unknown as { env?: Record<string, unknown> };
  return meta.env ?? {};
};

const isFeatureEnabled = (env?: Record<string, unknown>): boolean => {
  const source = resolveEnv(env);
  const value = source?.[FEATURE_FLAG_KEY];
  const normalized = normalizeBoolean(value);
  return normalized ?? false;
};

const resolveScheduler = (scheduler?: FrameScheduler | null): FrameScheduler | null => {
  if (scheduler !== undefined) {
    return scheduler ?? null;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  return {
    request: window.requestAnimationFrame.bind(window),
    cancel: window.cancelAnimationFrame.bind(window),
  };
};

const isSimulatingState = (state: GameStateValue): boolean => state === 'RUNNING';

const createNoopLoop = (): GameLoopController => ({
  start() {},
  stop() {},
  isRunning: () => false,
});

export const createGameLoop = ({
  state,
  scheduler: providedScheduler,
  env,
  maxDelta = DEFAULT_MAX_DELTA,
  maxSubSteps = DEFAULT_MAX_STEPS,
}: GameLoopOptions): GameLoopController => {
  if (!isFeatureEnabled(env)) {
    return createNoopLoop();
  }

  const scheduler = resolveScheduler(providedScheduler);
  if (!scheduler) {
    return createNoopLoop();
  }

  let frameHandle: number | null = null;
  let lastTimestamp: number | null = null;
  let accumulator = 0;
  let elapsed = 0;
  let running = false;

  const step: FrameRequestCallback = (timestampMs) => {
    frameHandle = null;

    if (!running) {
      return;
    }

    const currentState = state.getState();

    if (!isSimulatingState(currentState)) {
      lastTimestamp = timestampMs;
      frameHandle = scheduler.request(step);
      return;
    }

    if (lastTimestamp === null) {
      lastTimestamp = timestampMs;
      frameHandle = scheduler.request(step);
      return;
    }

    let deltaSeconds = (timestampMs - lastTimestamp) / 1000;
    lastTimestamp = timestampMs;

    if (deltaSeconds < 0) {
      deltaSeconds = 0;
    } else if (deltaSeconds > maxDelta) {
      deltaSeconds = maxDelta;
    }

    accumulator += deltaSeconds;

    let steps = 0;

    while (accumulator + STEP_EPSILON >= FIXED_TIME_STEP) {
      accumulator -= FIXED_TIME_STEP;
      elapsed += FIXED_TIME_STEP;
      bus.emit('game:tick', { dt: FIXED_TIME_STEP, elapsed });
      steps += 1;

      if (steps >= maxSubSteps) {
        accumulator = 0;
        break;
      }
    }

    frameHandle = scheduler.request(step);
  };

  const start = () => {
    if (running) {
      return;
    }

    running = true;
    frameHandle = scheduler.request(step);
  };

  const stop = () => {
    if (!running) {
      return;
    }

    running = false;

    if (frameHandle !== null) {
      scheduler.cancel(frameHandle);
      frameHandle = null;
    }

    lastTimestamp = null;
    accumulator = 0;
  };

  return {
    start,
    stop,
    isRunning: () => running,
  };
};

declare global {
  interface GameEvents {
    'game:tick': {
      dt: number;
      elapsed: number;
      /** Optional normalized delta provided by legacy publishers. */
      delta?: number;
      /** Optional frame counter provided by callers. */
      frame?: number;
      /** Optional elapsed milliseconds for the current frame. */
      elapsedMs?: number;
    };
  }
}

export type { GameStateValue };
