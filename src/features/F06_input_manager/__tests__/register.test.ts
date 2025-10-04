import { beforeEach, describe, expect, it, vi } from "vitest";

import { featureBus, resetFeatureBus } from "../../bus";
import { register, type InputFlapEvent } from "../register";

describe("F06 input manager register", () => {
  beforeEach(() => {
    resetFeatureBus();
    document.body.innerHTML = "";
  });

  const createCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    canvas.tabIndex = 0;
    document.body.appendChild(canvas);
    return canvas;
  };

  it("does nothing when the flag is disabled", () => {
    const canvas = createCanvas();
    const cleanup = register({ enabled: false, canvas });

    const handler = vi.fn();
    featureBus.on("feature:F06/input:flap", handler);

    canvas.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));

    expect(handler).not.toHaveBeenCalled();

    cleanup();
  });

  it("emits flap events for pointer, touch, and keyboard interactions", () => {
    const canvas = createCanvas();
    const cleanup = register({ enabled: true, canvas });
    const handler = vi.fn();
    const unsubscribe = featureBus.on("feature:F06/input:flap", handler);

    const pointerEvent = new Event("pointerdown", { bubbles: true, cancelable: true });
    canvas.dispatchEvent(pointerEvent);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0]).toMatchObject<InputFlapEvent>({
      source: "pointer",
      originalEvent: pointerEvent,
    });
    expect(pointerEvent.defaultPrevented).toBe(true);

    const touchEvent = new Event("touchstart", { bubbles: true, cancelable: true });
    canvas.dispatchEvent(touchEvent);

    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler.mock.calls[1][0]).toMatchObject<InputFlapEvent>({
      source: "touch",
      originalEvent: touchEvent,
    });
    expect(touchEvent.defaultPrevented).toBe(true);

    const keyEvent = new KeyboardEvent("keydown", {
      code: "Space",
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(keyEvent);

    expect(handler).toHaveBeenCalledTimes(3);
    expect(handler.mock.calls[2][0]).toMatchObject<InputFlapEvent>({
      source: "keyboard",
      originalEvent: keyEvent,
    });
    expect(keyEvent.defaultPrevented).toBe(true);

    unsubscribe();
    cleanup();
  });

  it("cleans up listeners when the disposer is invoked", () => {
    const canvas = createCanvas();
    const cleanup = register({ enabled: true, canvas });

    const handler = vi.fn();
    featureBus.on("feature:F06/input:flap", handler);

    cleanup();

    canvas.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));
    expect(handler).not.toHaveBeenCalled();
  });

  it("tears down listeners when the window unloads", () => {
    const canvas = createCanvas();
    const cleanup = register({ enabled: true, canvas });

    const handler = vi.fn();
    featureBus.on("feature:F06/input:flap", handler);

    window.dispatchEvent(new Event("beforeunload"));

    canvas.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));
    expect(handler).not.toHaveBeenCalled();

    cleanup();
  });

  it("toggles pointer lock when the pointer lock key is pressed", () => {
    const canvas = createCanvas();

    const requestPointerLock = vi.fn(function thisRequest(this: typeof canvas) {
      Object.defineProperty(document, "pointerLockElement", {
        configurable: true,
        writable: true,
        value: this,
      });
    });

    const exitPointerLock = vi.fn(() => {
      Object.defineProperty(document, "pointerLockElement", {
        configurable: true,
        writable: true,
        value: null,
      });
    });

    Object.defineProperty(canvas, "requestPointerLock", {
      configurable: true,
      writable: true,
      value: requestPointerLock,
    });

    Object.defineProperty(document, "exitPointerLock", {
      configurable: true,
      writable: true,
      value: exitPointerLock,
    });

    Object.defineProperty(document, "pointerLockElement", {
      configurable: true,
      writable: true,
      value: null,
    });

    const cleanup = register({ enabled: true, canvas });

    const toggleEvent = new KeyboardEvent("keydown", {
      code: "KeyP",
      bubbles: true,
      cancelable: true,
    });

    window.dispatchEvent(toggleEvent);
    expect(requestPointerLock).toHaveBeenCalledTimes(1);
    expect(document.pointerLockElement).toBe(canvas);

    const secondToggle = new KeyboardEvent("keydown", {
      code: "KeyP",
      bubbles: true,
      cancelable: true,
    });

    window.dispatchEvent(secondToggle);
    expect(exitPointerLock).toHaveBeenCalledTimes(1);
    expect(document.pointerLockElement).toBeNull();

    cleanup();
  });
});
