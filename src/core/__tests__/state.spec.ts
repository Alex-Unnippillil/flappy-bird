import { afterEach, describe, expect, it, vi } from 'vitest';
import { bus } from '../event-bus';
import { createGameStateMachine, GAME_STATES, type GameStateValue } from '../state';

const unsubscribeAll: Array<() => void> = [];

afterEach(() => {
  while (unsubscribeAll.length > 0) {
    const unsubscribe = unsubscribeAll.pop();
    unsubscribe?.();
  }
});

describe('game state machine', () => {
  it('starts in BOOT and transitions through the happy path', () => {
    const machine = createGameStateMachine();
    const events: Array<{ from: GameStateValue; to: GameStateValue }> = [];
    const unsubscribe = bus.on('game:state-change', (payload) => {
      events.push(payload);
    });
    unsubscribeAll.push(unsubscribe);

    expect(machine.getState()).toBe('BOOT');
    expect(machine.canTransition('READY')).toBe(true);
    expect(machine.transition('READY')).toBe(true);
    expect(machine.getState()).toBe('READY');

    expect(machine.canTransition('RUNNING')).toBe(true);
    expect(machine.transition('RUNNING')).toBe(true);
    expect(machine.getState()).toBe('RUNNING');

    expect(machine.transition('PAUSED')).toBe(true);
    expect(machine.getState()).toBe('PAUSED');

    expect(machine.transition('RUNNING')).toBe(true);
    expect(machine.getState()).toBe('RUNNING');

    expect(machine.transition('GAME_OVER')).toBe(true);
    expect(machine.getState()).toBe('GAME_OVER');

    expect(machine.transition('READY')).toBe(true);
    expect(machine.getState()).toBe('READY');

    expect(events).toEqual([
      { from: 'BOOT', to: 'READY' },
      { from: 'READY', to: 'RUNNING' },
      { from: 'RUNNING', to: 'PAUSED' },
      { from: 'PAUSED', to: 'RUNNING' },
      { from: 'RUNNING', to: 'GAME_OVER' },
      { from: 'GAME_OVER', to: 'READY' },
    ]);
  });

  it('guards illegal transitions', () => {
    const machine = createGameStateMachine();
    const spy = vi.fn();
    const unsubscribe = bus.on('game:state-change', spy);
    unsubscribeAll.push(unsubscribe);

    expect(machine.transition('RUNNING')).toBe(false);
    expect(machine.getState()).toBe('BOOT');
    expect(spy).not.toHaveBeenCalled();

    expect(machine.transition('READY')).toBe(true);
    expect(machine.transition('READY')).toBe(false);
    expect(machine.getState()).toBe('READY');

    expect(machine.transition('PAUSED')).toBe(false);
    expect(machine.getState()).toBe('READY');
  });

  it('resets back to the initial state when requested', () => {
    const machine = createGameStateMachine();
    const events: Array<{ from: GameStateValue; to: GameStateValue }> = [];
    const unsubscribe = bus.on('game:state-change', (payload) => {
      events.push(payload);
    });
    unsubscribeAll.push(unsubscribe);

    machine.transition('READY');
    machine.transition('RUNNING');
    expect(machine.getState()).toBe('RUNNING');

    machine.reset();
    expect(machine.getState()).toBe('BOOT');

    expect(events).toEqual([
      { from: 'BOOT', to: 'READY' },
      { from: 'READY', to: 'RUNNING' },
      { from: 'RUNNING', to: 'BOOT' },
    ]);
  });

  it('rejects invalid initial states', () => {
    expect(() => createGameStateMachine('READY' as GameStateValue)).not.toThrow();
    expect(() => createGameStateMachine('INVALID' as GameStateValue)).toThrowError(
      /invalid initial game state/i,
    );
  });

  it('exposes the available state values', () => {
    expect(GAME_STATES).toEqual(['BOOT', 'READY', 'RUNNING', 'PAUSED', 'GAME_OVER']);
  });
});
