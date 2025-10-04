import { beforeEach, describe, expect, it, vi } from "vitest";

import { FeatureBus } from "../../bus";
import {
  BIRD_COLLIDE_EVENT,
  BIRD_POSITION_EVENT,
  GAME_OVER_STATE,
  GAME_RESET_EVENT,
  register,
  type BirdPositionUpdatePayload,
  type GameStateValue,
  type GameStateMachine,
} from "../register";

type MutableGameStateMachine = GameStateMachine & {
  current: GameStateValue;
  setCurrent(state: GameStateValue): void;
};

const createStateMachine = (): MutableGameStateMachine => {
  let current: GameStateValue = "RUNNING";
  const transition = vi.fn((next: GameStateValue) => {
    current = next;
  });
  return {
    get current() {
      return current;
    },
    transition,
    setCurrent(state: GameStateValue) {
      current = state;
    },
  };
};

describe("F13 ground collision register", () => {
  let bus: FeatureBus;
  let stateMachine: MutableGameStateMachine;

  beforeEach(() => {
    bus = new FeatureBus();
    stateMachine = createStateMachine();
  });

  const emitPosition = (payload: BirdPositionUpdatePayload) => {
    bus.emit(BIRD_POSITION_EVENT, payload);
  };

  it("emits a collision event and transitions to GAME_OVER on ground contact", () => {
    const collisions: BirdPositionUpdatePayload[] = [];
    bus.on(BIRD_COLLIDE_EVENT, (detail) => {
      collisions.push({
        position: detail.position,
        radius: 0,
        dt: detail.dt,
      });
    });

    const cleanup = register({
      bus,
      stateMachine,
      groundHeight: 0,
      freezeFlagEnabled: false,
    });

    emitPosition({
      position: { x: 0, y: 1, z: 0 },
      radius: 0.5,
      dt: 1 / 60,
    });

    emitPosition({
      position: { x: 0, y: 0.2, z: 0 },
      radius: 0.5,
      dt: 1 / 60,
    });

    expect(collisions).toHaveLength(1);
    expect(stateMachine.transition).toHaveBeenCalledTimes(1);
    expect(stateMachine.transition).toHaveBeenCalledWith(GAME_OVER_STATE);

    cleanup();
  });

  it("performs swept collision checks for large dt values", () => {
    const handler = vi.fn();
    bus.on(BIRD_COLLIDE_EVENT, handler);

    register({
      bus,
      stateMachine,
      groundHeight: 0,
      freezeFlagEnabled: false,
    });

    emitPosition({
      position: { x: 0, y: 2, z: 0 },
      radius: 0.4,
      dt: 1 / 30,
    });

    emitPosition({
      position: { x: 0, y: -3, z: 0 },
      radius: 0.4,
      dt: 1 / 30,
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(stateMachine.transition).toHaveBeenCalledTimes(1);
    expect(stateMachine.transition).toHaveBeenLastCalledWith(GAME_OVER_STATE);
  });

  it("freezes the bird rigidbody when the feature flag is enabled", () => {
    const rigidBody = {
      setLinvel: vi.fn(),
      setAngvel: vi.fn(),
      lockTranslations: vi.fn(),
      lockRotations: vi.fn(),
      sleep: vi.fn(),
    };

    register({
      bus,
      stateMachine,
      groundHeight: 0,
      freezeFlagEnabled: true,
    });

    emitPosition({
      position: { x: 0, y: 0.3, z: 0 },
      radius: 0.4,
      dt: 1 / 60,
      rigidBody,
    });

    expect(rigidBody.setLinvel).toHaveBeenCalledWith({ x: 0, y: 0, z: 0 }, true);
    expect(rigidBody.setAngvel).toHaveBeenCalledWith({ x: 0, y: 0, z: 0 }, true);
    expect(rigidBody.lockTranslations).toHaveBeenCalledWith(true, true);
    expect(rigidBody.lockRotations).toHaveBeenCalledWith(true, true);
    expect(rigidBody.sleep).toHaveBeenCalledTimes(1);
  });

  it("resets internal state when a game reset event is emitted", () => {
    const handler = vi.fn();
    bus.on(BIRD_COLLIDE_EVENT, handler);

    register({
      bus,
      stateMachine,
      groundHeight: 0,
      freezeFlagEnabled: false,
    });

    emitPosition({
      position: { x: 0, y: 1, z: 0 },
      radius: 0.5,
      dt: 1 / 60,
    });

    emitPosition({
      position: { x: 0, y: 0.3, z: 0 },
      radius: 0.5,
      dt: 1 / 60,
    });

    expect(handler).toHaveBeenCalledTimes(1);

    bus.emit(GAME_RESET_EVENT, undefined);
    stateMachine.setCurrent("RUNNING");

    emitPosition({
      position: { x: 0, y: 1, z: 0 },
      radius: 0.5,
      dt: 1 / 60,
    });

    emitPosition({
      position: { x: 0, y: 0.25, z: 0 },
      radius: 0.5,
      dt: 1 / 60,
    });

    expect(handler).toHaveBeenCalledTimes(2);
    expect(stateMachine.transition).toHaveBeenCalledTimes(2);
  });

  it("removes listeners when the cleanup function is invoked", () => {
    const handler = vi.fn();
    bus.on(BIRD_COLLIDE_EVENT, handler);

    const cleanup = register({
      bus,
      stateMachine,
      groundHeight: 0,
      freezeFlagEnabled: false,
    });

    cleanup();

    emitPosition({
      position: { x: 0, y: -1, z: 0 },
      radius: 0.4,
      dt: 1 / 60,
    });

    expect(handler).not.toHaveBeenCalled();
    expect(stateMachine.transition).not.toHaveBeenCalled();
  });
});
