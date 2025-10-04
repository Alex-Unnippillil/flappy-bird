import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const FEATURE_FLAG_KEY = "FEATURE_F10_SCORE_HUD";

const setupStage = () => {
  const stage = document.createElement("section");
  stage.className = "game-stage";
  const canvas = document.createElement("canvas");
  canvas.id = "gameCanvas";
  stage.appendChild(canvas);
  document.body.appendChild(stage);
  return stage;
};

describe("F10 score HUD register", () => {
  beforeEach(() => {
    vi.resetModules();
    delete (globalThis as { __FEATURE_FLAGS__?: Record<string, unknown> })
      .__FEATURE_FLAGS__;
    document.body.innerHTML = "";
  });

  afterEach(() => {
    delete process.env[FEATURE_FLAG_KEY];
    document.body.innerHTML = "";
  });

  it("installs the DOM overlay when the feature flag is enabled", async () => {
    process.env[FEATURE_FLAG_KEY] = "true";
    const stage = setupStage();

    const { initializeScoreHud, teardownScoreHud } = await import("./register");
    const instance = initializeScoreHud();

    expect(instance).not.toBeNull();
    expect(stage.querySelector(".f10-score-hud")?.textContent).toBe("0");

    teardownScoreHud();
  });

  it("updates the overlay when pipe cleared events fire", async () => {
    process.env[FEATURE_FLAG_KEY] = "true";
    const stage = setupStage();
    const { initializeScoreHud, teardownScoreHud, PIPE_CLEARED_EVENT } =
      await import("./register");

    const instance = initializeScoreHud();
    expect(instance).not.toBeNull();

    window.dispatchEvent(new CustomEvent(PIPE_CLEARED_EVENT));

    expect(stage.querySelector(".f10-score-hud")?.textContent).toBe("1");

    teardownScoreHud();
  });
});
