import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createGameState } from "./state.js";
import {
  handleCanvasClick,
  initializeGameLoop,
  teardownGameLoop,
} from "./loop.js";
import { createThreeRenderer } from "../../rendering/three/renderer.js";

vi.mock("../../rendering/three/renderer.js", () => ({
  createThreeRenderer: vi.fn(() => ({
    render: vi.fn(),
    pulseBird: vi.fn(),
    markGameOver: vi.fn(),
    dispose: vi.fn(),
  })),
}));

vi.mock("../../rendering/index.js", () => ({
  createHudController: vi.fn(() => ({
    setScore: vi.fn(),
    setBest: vi.fn(),
    setSpeed: vi.fn(),
    showIntro: vi.fn(),
    showRunning: vi.fn(),
    showGameOver: vi.fn(),
    destroy: vi.fn(),
    awardMedal: vi.fn(),
    clearMedal: vi.fn(),
    onStart: vi.fn(),
    onRestart: vi.fn(),
    pauseMenu: { destroy: vi.fn() },
    hudRoot: { destroy: vi.fn() },
    events: { on: vi.fn(), off: vi.fn() },
  })),
}));

describe("handleCanvasClick", () => {
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.requestAnimationFrame = vi
      .fn<(callback: FrameRequestCallback) => number>(() => 1);
    globalThis.cancelAnimationFrame = vi.fn<(handle: number) => void>();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    teardownGameLoop();
    document.body.innerHTML = "";
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
  });

  it("starts the round with an immediate flap on the first interaction", () => {
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    const gameState = createGameState(canvas);

    initializeGameLoop(gameState);

    expect(gameState.awaitingStart).toBe(true);
    handleCanvasClick();

    expect(gameState.isRunning).toBe(true);
    expect(gameState.awaitingStart).toBe(false);
    expect(gameState.bird).not.toBeNull();
    expect(gameState.bird.velocity).toBeLessThan(0);

    const rendererFactory = vi.mocked(createThreeRenderer);
    const lastCallIndex = rendererFactory.mock.results.length - 1;
    const rendererInstance =
      lastCallIndex >= 0 ? rendererFactory.mock.results[lastCallIndex]?.value : null;
    expect(rendererInstance?.pulseBird).toHaveBeenCalledTimes(1);
  });
});
