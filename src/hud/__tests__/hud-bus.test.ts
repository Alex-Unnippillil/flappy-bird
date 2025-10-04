import { afterEach, describe, expect, it, vi } from "vitest";
import { HUD_CHANNEL_SCORE_TICK } from "../hud-events";
import {
  hasSubscribers,
  publish,
  resetHudBus,
  subscribe,
  unsubscribe,
} from "../hud-bus";

afterEach(() => {
  resetHudBus();
});

describe("hud bus score ticker", () => {
  it("delivers score tick payloads to subscribers", () => {
    const handler = vi.fn();
    const unsubscribeHandler = subscribe(HUD_CHANNEL_SCORE_TICK, handler);

    expect(hasSubscribers(HUD_CHANNEL_SCORE_TICK)).toBe(true);

    const payload = { increment: 1, total: 5 } as const;
    const published = publish(HUD_CHANNEL_SCORE_TICK, payload);

    expect(published).toBe(true);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(payload);

    unsubscribeHandler();
    expect(hasSubscribers(HUD_CHANNEL_SCORE_TICK)).toBe(false);
  });

  it("returns false when publishing without subscribers", () => {
    const payload = { increment: 2, total: 10 } as const;
    const published = publish(HUD_CHANNEL_SCORE_TICK, payload);

    expect(published).toBe(false);
  });

  it("supports multiple subscribers and targeted unsubscription", () => {
    const first = vi.fn();
    const second = vi.fn();

    subscribe(HUD_CHANNEL_SCORE_TICK, first);
    subscribe(HUD_CHANNEL_SCORE_TICK, second);

    const payload = { increment: 3, total: 15 } as const;
    publish(HUD_CHANNEL_SCORE_TICK, payload);

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);

    const removed = unsubscribe(HUD_CHANNEL_SCORE_TICK, first);
    expect(removed).toBe(true);
    expect(hasSubscribers(HUD_CHANNEL_SCORE_TICK)).toBe(true);

    resetHudBus();
    expect(hasSubscribers(HUD_CHANNEL_SCORE_TICK)).toBe(false);
  });

  it("returns false when attempting to unsubscribe a handler that was never registered", () => {
    const handler = vi.fn();
    const removed = unsubscribe(HUD_CHANNEL_SCORE_TICK, handler);

    expect(removed).toBe(false);
  });
});
