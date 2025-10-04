import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SCORE_ANIM_CLASS, SCORE_ANIM_ENTER_CLASS, SCORE_ANIM_VISIBLE_CLASS } from "../hud/components/ScoreAnim";
import { createHudController } from "./index.js";

describe("createHudController", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "requestAnimationFrame",
      ((callback: FrameRequestCallback) => {
        return setTimeout(() => callback(Date.now()), 16) as unknown as number;
      }) satisfies typeof requestAnimationFrame
    );

    document.body.innerHTML = `
      <div class="hud-panel">
        <div class="hud-metric" aria-live="polite">
          <span class="hud-label">Score</span>
          <span id="scoreValue" class="hud-value">0</span>
        </div>
      </div>
    `;
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("triggers the intro animation for the score metric", () => {
    createHudController();

    const metric = document.querySelector(".hud-metric");
    expect(metric?.classList.contains(SCORE_ANIM_CLASS)).toBe(true);
    expect(metric?.classList.contains(SCORE_ANIM_ENTER_CLASS)).toBe(true);

    vi.runAllTimers();

    expect(metric?.classList.contains(SCORE_ANIM_ENTER_CLASS)).toBe(false);
    expect(metric?.classList.contains(SCORE_ANIM_VISIBLE_CLASS)).toBe(true);
  });
});
