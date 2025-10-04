import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { RetryButton } from "./RetryButton";
import { HUD_RETRY, hudEventBus } from "../bus";

describe("RetryButton", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    hudEventBus.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    hudEventBus.clear();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("disables itself for the cooldown duration after activation", () => {
    const button = new RetryButton({ targetDocument: document });
    document.body.appendChild(button.element);

    const listener = vi.fn();
    const unsubscribe = hudEventBus.subscribe(HUD_RETRY, listener);

    button.element.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(listener).toHaveBeenCalledTimes(1);
    expect(button.element.disabled).toBe(true);
    expect(button.element.getAttribute("aria-disabled")).toBe("true");

    vi.advanceTimersByTime(399);
    expect(button.element.disabled).toBe(true);

    vi.advanceTimersByTime(1);
    expect(button.element.disabled).toBe(false);
    expect(button.element.hasAttribute("aria-disabled")).toBe(false);

    unsubscribe();
    button.destroy();
  });

  it("prevents repeated retry events while on cooldown", () => {
    const button = new RetryButton({ targetDocument: document, cooldownMs: 400 });
    document.body.appendChild(button.element);

    const listener = vi.fn();
    const unsubscribe = hudEventBus.subscribe(HUD_RETRY, listener);

    button.element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    button.element.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(listener).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(400);

    button.element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    button.destroy();
  });
});
