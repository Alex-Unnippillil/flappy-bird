import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import {
  HUD_GAME_OVER,
  initSessionStats,
  type SessionStatsDetail,
} from "./SessionStats";

const baseDetail: SessionStatsDetail = {
  attempts: 3,
  averageScore: 6,
  averageDurationMs: 12345,
  lastScore: 4,
  lastDurationMs: 10234,
  sessionBest: 10,
  bestScore: 12,
};

describe("SessionStatsPanel", () => {
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
    document.body.innerHTML = '<div id="sessionStats"></div>';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  function dispatch(detail: SessionStatsDetail = baseDetail) {
    window.dispatchEvent(new CustomEvent(HUD_GAME_OVER, { detail }));
  }

  it("renders stats when a HUD_GAME_OVER event is emitted", () => {
    initSessionStats();
    dispatch();

    const attempts = document.querySelector(
      '[data-stat="attempts"] .session-stats__value'
    );
    const averageScore = document.querySelector(
      '[data-stat="averageScore"] .session-stats__value'
    );
    const lastDuration = document.querySelector(
      '[data-stat="lastDurationMs"] .session-stats__value'
    );

    expect(attempts?.textContent).toBe("3 plays");
    expect(averageScore?.textContent).toBe("6");
    expect(lastDuration?.textContent).toBe("10s");
  });

  it("supports toggling via pointer and keyboard interactions", () => {
    initSessionStats();
    dispatch();

    const toggle = document.querySelector<HTMLButtonElement>(
      ".session-stats__toggle"
    );
    const panel = document.querySelector<HTMLDivElement>(
      ".session-stats__panel"
    );

    expect(toggle).toBeTruthy();
    expect(panel?.hidden).toBe(false);

    toggle?.click();
    expect(panel?.hidden).toBe(true);
    expect(document.activeElement).toBe(toggle);

    toggle?.click();
    expect(panel?.hidden).toBe(false);
    expect(document.activeElement).toBe(panel);

    panel?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(panel?.hidden).toBe(true);
    expect(document.activeElement).toBe(toggle);
  });
});
