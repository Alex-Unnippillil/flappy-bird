import { beforeEach, describe, expect, it, vi } from "vitest";

import { featureBus, resetFeatureBus } from "../../bus";
import { bus } from "@/core";
import { register, type FlapInputEvent } from "../register";

describe("F09 flap input register", () => {
  beforeEach(() => {
    resetFeatureBus();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const createCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    canvas.tabIndex = 0;
    document.body.appendChild(canvas);
    return canvas;
  };

  const setRunningState = (state: string) => {
    bus.emit("game:state-change", { state });
  };

  it("exits early when the feature flag is disabled", () => {
    const canvas = createCanvas();
    const cleanup = register({ env: { VITE_FF_F09: "false" }, canvas });

    const handler = vi.fn();
    featureBus.on("feature:F09/flap", handler);

    setRunningState("running");
    canvas.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));

    expect(handler).not.toHaveBeenCalled();

    cleanup();
  });

  it("emits a single flap event per user action across input types", () => {
    vi.useFakeTimers();
    const canvas = createCanvas();
    const cleanup = register({ env: { VITE_FF_F09: "true" }, canvas });
    const handler = vi.fn();
    const unsubscribe = featureBus.on("feature:F09/flap", handler);

    const nowSpy = vi
      .spyOn(window.performance, "now")
      .mockImplementationOnce(() => 100)
      .mockImplementationOnce(() => 100)
      .mockImplementation(() => 250);

    setRunningState("running");

    const pointerEvent = new Event("pointerdown", { bubbles: true, cancelable: true });
    canvas.dispatchEvent(pointerEvent);

    const touchEvent = new Event("touchstart", { bubbles: true, cancelable: true });
    canvas.dispatchEvent(touchEvent);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0]).toMatchObject<FlapInputEvent>({
      source: "pointer",
      originalEvent: pointerEvent,
    });

    vi.advanceTimersByTime(100);

    const keyEvent = new KeyboardEvent("keydown", {
      code: "Space",
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(keyEvent);

    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler.mock.calls[1][0]).toMatchObject<FlapInputEvent>({
      source: "keyboard",
      originalEvent: keyEvent,
    });

    expect(pointerEvent.defaultPrevented).toBe(true);
    expect(touchEvent.defaultPrevented).toBe(false);
    expect(keyEvent.defaultPrevented).toBe(true);

    nowSpy.mockRestore();
    unsubscribe();
    cleanup();
  });

  it("ignores interactions when the game is not running", () => {
    vi.useFakeTimers();
    const canvas = createCanvas();
    const cleanup = register({ env: { VITE_FF_F09: "true" }, canvas });
    const handler = vi.fn();
    featureBus.on("feature:F09/flap", handler);

    const nowSpy = vi.spyOn(window.performance, "now").mockReturnValue(400);

    const pointerEvent = new Event("pointerdown", { bubbles: true, cancelable: true });
    canvas.dispatchEvent(pointerEvent);

    expect(handler).not.toHaveBeenCalled();

    setRunningState("running");
    canvas.dispatchEvent(pointerEvent);
    expect(handler).toHaveBeenCalledTimes(1);

    setRunningState("paused");
    const touchEvent = new Event("touchstart", { bubbles: true, cancelable: true });
    canvas.dispatchEvent(touchEvent);

    expect(handler).toHaveBeenCalledTimes(1);

    setRunningState("running");
    nowSpy.mockReturnValue(410);

    const keyEvent = new KeyboardEvent("keydown", {
      code: "Space",
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(keyEvent);

    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler.mock.calls[1][0]).toMatchObject<FlapInputEvent>({
      source: "keyboard",
      originalEvent: keyEvent,
    });

    nowSpy.mockRestore();
    cleanup();
  });

  it("resets the debounce window when the game state changes", () => {
    vi.useFakeTimers();
    const canvas = createCanvas();
    const cleanup = register({ env: { VITE_FF_F09: "true" }, canvas, debounceMs: 120 });
    const handler = vi.fn();
    featureBus.on("feature:F09/flap", handler);

    const nowSpy = vi
      .spyOn(window.performance, "now")
      .mockImplementationOnce(() => 1000)
      .mockImplementation(() => 1050);

    setRunningState("running");

    const pointerEvent = new Event("pointerdown", { bubbles: true, cancelable: true });
    canvas.dispatchEvent(pointerEvent);
    expect(handler).toHaveBeenCalledTimes(1);

    setRunningState("paused");
    setRunningState("running");

    const touchEvent = new Event("touchstart", { bubbles: true, cancelable: true });
    canvas.dispatchEvent(touchEvent);

    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler.mock.calls[1][0]).toMatchObject<FlapInputEvent>({
      source: "touch",
      originalEvent: touchEvent,
    });

    nowSpy.mockRestore();
    cleanup();
  });
});
