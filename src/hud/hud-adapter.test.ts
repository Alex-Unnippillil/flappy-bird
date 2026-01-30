import { beforeEach, describe, expect, it, vi } from 'vitest';

const { publishSpy, isHudEnabledMock } = vi.hoisted(() => ({
  publishSpy: vi.fn(),
  isHudEnabledMock: vi.fn(() => true),
}));

vi.mock('./hud-bus', () => ({
  publishHudEvent: publishSpy,
  HUD_EVENTS: {
    score: 'hud:score',
    gameOver: 'hud:game-over',
    pause: 'hud:pause',
  },
}));

vi.mock('./hud-settings', () => ({
  isHudEnabled: isHudEnabledMock,
}));

import { hud, onGameOver, onPause, onScore, type GameOverPayload } from './hud-adapter';
import { HUD_EVENTS } from './hud-bus';

describe('hud adapter', () => {
  beforeEach(() => {
    publishSpy.mockClear();
    isHudEnabledMock.mockReturnValue(true);
  });

  it('publishes score deltas to the bus when enabled', () => {
    onScore(3);

    expect(publishSpy).toHaveBeenCalledTimes(1);
    expect(publishSpy).toHaveBeenCalledWith(HUD_EVENTS.score, { delta: 3 });
  });

  it('stops publishing when the HUD is disabled', () => {
    isHudEnabledMock.mockReturnValue(false);

    onScore(5);

    expect(publishSpy).not.toHaveBeenCalled();
  });

  it('forwards game over payloads untouched', () => {
    const payload: GameOverPayload = { score: 9, bestScore: 42, reason: 'test' };

    onGameOver(payload);

    expect(publishSpy).toHaveBeenCalledWith(HUD_EVENTS.gameOver, payload);
  });

  it('forwards pause state updates', () => {
    onPause(true);

    expect(publishSpy).toHaveBeenCalledWith(HUD_EVENTS.pause, { isPaused: true });
  });

  it('exposes namespaced helpers that reference the same implementations', () => {
    expect(hud.onScore).toBe(onScore);
    expect(hud.onGameOver).toBe(onGameOver);
    expect(hud.onPause).toBe(onPause);
  });
});
