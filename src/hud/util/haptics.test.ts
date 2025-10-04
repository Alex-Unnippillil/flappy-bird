import { describe, expect, it, vi } from "vitest";
import { createHapticsAdapter, detectVibrationSupport, type NavigatorLike } from "./haptics";

describe("detectVibrationSupport", () => {
  it("reports unsupported when navigator is undefined", () => {
    const result = detectVibrationSupport(undefined);
    expect(result.supported).toBe(false);
    expect(result.vibrate).toBeNull();
  });

  it("reports unsupported when vibrate is not a function", () => {
    const fakeNavigator: NavigatorLike = {};
    const result = detectVibrationSupport(fakeNavigator);
    expect(result.supported).toBe(false);
    expect(result.vibrate).toBeNull();
  });

  it("binds the vibrate function when available", () => {
    const vibrate = vi.fn<
      ReturnType<NonNullable<NavigatorLike["vibrate"]>>,
      Parameters<NonNullable<NavigatorLike["vibrate"]>>
    >(() => true);
    const fakeNavigator: NavigatorLike = { vibrate };
    const result = detectVibrationSupport(fakeNavigator);

    expect(result.supported).toBe(true);
    expect(result.vibrate).toBeTypeOf("function");
    result.vibrate?.(10);
    expect(vibrate).toHaveBeenCalledWith(10);
  });
});

describe("createHapticsAdapter", () => {
  it("falls back gracefully when vibration is unsupported", () => {
    const adapter = createHapticsAdapter({ navigator: undefined });

    expect(adapter.supported).toBe(false);
    expect(() => adapter.scoreMilestone(5)).not.toThrow();
    expect(() => adapter.medalEarned("gold")).not.toThrow();
  });

  it("delegates to navigator.vibrate when supported", () => {
    const vibrate = vi.fn<
      ReturnType<NonNullable<NavigatorLike["vibrate"]>>,
      Parameters<NonNullable<NavigatorLike["vibrate"]>>
    >(() => true);
    const fakeNavigator: NavigatorLike = { vibrate };

    const adapter = createHapticsAdapter({ navigator: fakeNavigator });
    expect(adapter.supported).toBe(true);

    adapter.scoreMilestone(1);
    expect(vibrate).toHaveBeenCalled();

    vibrate.mockClear();
    adapter.medalEarned("gold");
    expect(vibrate).toHaveBeenCalled();
  });
});
