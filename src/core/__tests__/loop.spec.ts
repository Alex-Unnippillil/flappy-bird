import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bus } from '../event-bus';
import {
  createGameLoop,
  FIXED_TIME_STEP,
  type FrameScheduler,
  type GameTickDetail,
} from '../loop';
import { createGameStateMachine } from '../state';

type TickPayload = GameTickDetail;

class TestScheduler {
  private callbacks = new Map<number, FrameRequestCallback>();
  private nextHandle = 1;

  public readonly scheduler: FrameScheduler = {
    request: (callback) => {
      const handle = this.nextHandle++;
      this.callbacks.set(handle, callback);
      return handle;
    },
    cancel: (handle) => {
      this.callbacks.delete(handle);
    },
  };

  step(timestamp: number) {
    const entries = Array.from(this.callbacks.entries());
    this.callbacks.clear();
    for (const [, callback] of entries) {
      callback(timestamp);
    }
  }

  hasPending(): boolean {
    return this.callbacks.size > 0;
  }
}

const unsubscribeAll: Array<() => void> = [];

beforeEach(() => {
  vi.stubEnv('VITE_FF_F02', 'true');
});

beforeEach(() => {
  while (unsubscribeAll.length > 0) {
    const unsubscribe = unsubscribeAll.pop();
    unsubscribe?.();
  }
});

afterEach(() => {
  vi.unstubAllEnvs();
  while (unsubscribeAll.length > 0) {
    const unsubscribe = unsubscribeAll.pop();
    unsubscribe?.();
  }
});

describe('game loop', () => {
  it('emits fixed dt ticks when enabled via feature flag', () => {
    const state = createGameStateMachine();
    state.transition('READY');
    state.transition('RUNNING');

    const scheduler = new TestScheduler();
    const loop = createGameLoop({
      state,
      scheduler: scheduler.scheduler,
      env: { VITE_FF_F03: 'true' },
    });

    const ticks: TickPayload[] = [];
    const unsubscribe = bus.on('game:tick', (payload) => {
      ticks.push(payload);
    });
    unsubscribeAll.push(unsubscribe);

    loop.start();

    const frame = 1000 * FIXED_TIME_STEP;

    scheduler.step(0);
    scheduler.step(frame);
    scheduler.step(frame * 2);
    scheduler.step(frame * 3);

    expect(ticks).toHaveLength(3);
    ticks.forEach((tick, index) => {
      expect(tick.dt).toBeCloseTo(FIXED_TIME_STEP, 6);
      expect(tick.delta).toBeCloseTo(1, 6);
      expect(tick.frame).toBe(index + 1);
      expect(tick.elapsed).toBeCloseTo(FIXED_TIME_STEP * (index + 1), 6);
      expect(tick.elapsedMs).toBeCloseTo(FIXED_TIME_STEP * (index + 1) * 1000, 6);
    });

    loop.stop();
  });

  it('halts accumulation while paused and resumes without drift', () => {
    const state = createGameStateMachine();
    state.transition('READY');
    state.transition('RUNNING');

    const scheduler = new TestScheduler();
    const loop = createGameLoop({
      state,
      scheduler: scheduler.scheduler,
      env: { VITE_FF_F03: 'true' },
    });

    const ticks: TickPayload[] = [];
    const unsubscribe = bus.on('game:tick', (payload) => {
      ticks.push(payload);
    });
    unsubscribeAll.push(unsubscribe);

    loop.start();

    const frame = 1000 * FIXED_TIME_STEP;

    scheduler.step(0);
    scheduler.step(frame);

    expect(ticks).toHaveLength(1);

    state.transition('PAUSED');

    scheduler.step(frame * 2);
    scheduler.step(frame * 3);

    expect(ticks).toHaveLength(1);

    state.transition('RUNNING');
    scheduler.step(frame * 4);

    expect(ticks).toHaveLength(2);
    expect(ticks[1].dt).toBeCloseTo(FIXED_TIME_STEP, 6);
    expect(ticks[1].delta).toBeCloseTo(1, 6);
    expect(ticks[1].frame).toBe(2);
    expect(ticks[1].elapsed).toBeCloseTo(FIXED_TIME_STEP * 2, 6);
    expect(ticks[1].elapsedMs).toBeCloseTo(FIXED_TIME_STEP * 2 * 1000, 6);

    loop.stop();
  });

  it('does not run when the feature flag is disabled', () => {
    const state = createGameStateMachine();
    state.transition('READY');
    state.transition('RUNNING');

    const scheduler = new TestScheduler();
    const loop = createGameLoop({
      state,
      scheduler: scheduler.scheduler,
      env: { VITE_FF_F03: 'false' },
    });

    const unsubscribe = bus.on('game:tick', () => {
      throw new Error('tick should not fire when feature flag is disabled');
    });
    unsubscribeAll.push(unsubscribe);

    loop.start();

    const frame = 1000 * FIXED_TIME_STEP;
    scheduler.step(0);
    scheduler.step(frame);
    scheduler.step(frame * 2);

    expect(loop.isRunning()).toBe(false);
    expect(scheduler.hasPending()).toBe(false);
  });
});
