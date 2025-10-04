import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  SCORE_ANIM_CLASS,
  SCORE_ANIM_ENTER_CLASS,
  SCORE_ANIM_VISIBLE_CLASS,
  applyScoreMountAnimation,
} from "./ScoreAnim";

describe("applyScoreMountAnimation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "requestAnimationFrame",
      ((callback: FrameRequestCallback) => {
        return setTimeout(() => callback(Date.now()), 16) as unknown as number;
      }) satisfies typeof requestAnimationFrame
    );
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("applies base and enter classes immediately", () => {
    const element = document.createElement("span");

    applyScoreMountAnimation(element);

    expect(element.classList.contains(SCORE_ANIM_CLASS)).toBe(true);
    expect(element.classList.contains(SCORE_ANIM_ENTER_CLASS)).toBe(true);
    expect(element.classList.contains(SCORE_ANIM_VISIBLE_CLASS)).toBe(false);
  });

  it("transitions to the visible state on the next frame", () => {
    const element = document.createElement("span");

    applyScoreMountAnimation(element);
    vi.runAllTimers();

    expect(element.classList.contains(SCORE_ANIM_ENTER_CLASS)).toBe(false);
    expect(element.classList.contains(SCORE_ANIM_VISIBLE_CLASS)).toBe(true);
  });

  it("runs only once per target", () => {
    const element = document.createElement("span");

    applyScoreMountAnimation(element);
    applyScoreMountAnimation(element);
    vi.runAllTimers();

    expect(element.getAttribute("data-score-anim")).toBe("true");
    expect(element.classList.contains(SCORE_ANIM_VISIBLE_CLASS)).toBe(true);
  });

  it("ignores non-HTMLElement targets", () => {
    const textNode = document.createTextNode("0");

    // @ts-expect-error intentionally passing an invalid target to ensure it is ignored
    applyScoreMountAnimation(textNode);

    expect(textNode.parentElement).toBeNull();
  });
});
