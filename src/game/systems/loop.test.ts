import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { Mock, MockInstance } from "vitest";

const rendererMock = vi.hoisted(() => ({
  render: vi.fn(),
  pulseBird: vi.fn(),
  markGameOver: vi.fn(),
  dispose: vi.fn(),
}));

vi.mock("../../rendering/three/renderer.js", () => ({
  createThreeRenderer: vi.fn(() => rendererMock),
}));

const originalMatchMedia = window.matchMedia;
const matchMediaStub: Mock<[query: string], MediaQueryList> = vi.fn(
  (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  })
);

import {
  initializeGameLoop,
  startGame,
  pauseGame,
  resumeGame,
  teardownGameLoop,
} from "./loop.js";
import { createGameState } from "./state.js";

function setupHudDom() {
  const container = document.createElement("div");
  const overlay = document.createElement("div");
  overlay.id = "gameOverlay";
  container.appendChild(overlay);

  const message = document.createElement("div");
  message.id = "gameMessage";
  overlay.appendChild(message);

  const score = document.createElement("div");
  score.id = "scoreValue";
  overlay.appendChild(score);

  const best = document.createElement("div");
  best.id = "bestValue";
  overlay.appendChild(best);

  const startButton = document.createElement("button");
  startButton.id = "startButton";
  overlay.appendChild(startButton);

  const speedBar = document.createElement("div");
  speedBar.id = "speedFill";
  overlay.appendChild(speedBar);

  const speedProgress = document.createElement("div");
  speedProgress.id = "speedProgress";
  overlay.appendChild(speedProgress);

  const perfectIndicator = document.createElement("div");
  perfectIndicator.id = "perfectIndicator";
  overlay.appendChild(perfectIndicator);

  document.body.appendChild(container);

  return { container, overlay };
}

describe("game loop pause flow", () => {
  let canvas: HTMLCanvasElement;
  let rafCallbacks: Map<number, FrameRequestCallback>;
  let rafSpy: MockInstance<[FrameRequestCallback], number> | undefined;
  let cafSpy: MockInstance<[number], void> | undefined;
  let timestamp: number;

  beforeEach(() => {
    setupHudDom();
    canvas = document.createElement("canvas");
    document.body.appendChild(canvas);

    rafCallbacks = new Map();
    let nextId = 1;
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = (callback) =>
        window.setTimeout(() => callback(performance.now()), 16);
    }
    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = (id) => window.clearTimeout(Number(id));
    }
    rafSpy = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        const id = nextId++;
        rafCallbacks.set(id, callback);
        return id;
      });
    cafSpy = vi
      .spyOn(window, "cancelAnimationFrame")
      .mockImplementation((id) => {
        rafCallbacks.delete(Number(id));
      });
    timestamp = 0;
    matchMediaStub.mockClear();
    window.matchMedia = matchMediaStub;
    rendererMock.render.mockClear();
    rendererMock.pulseBird.mockClear();
    rendererMock.markGameOver.mockClear();
    rendererMock.dispose.mockClear();
  });

  afterEach(() => {
    teardownGameLoop();
    rafSpy?.mockRestore();
    cafSpy?.mockRestore();
    document.body.innerHTML = "";
    rafCallbacks.clear();
    window.matchMedia = originalMatchMedia;
  });

  function flushFrames(delta = 16) {
    const callbacks = Array.from(rafCallbacks.values());
    rafCallbacks.clear();
    callbacks.forEach((callback) => {
      timestamp += delta;
      callback(timestamp);
    });
  }

  function createState() {
    const state = createGameState(canvas);
    const { hud } = initializeGameLoop(state, {
      hudElements: {
        score: "#scoreValue",
        best: "#bestValue",
        message: "#gameMessage",
        startButton: "#startButton",
        overlay: "#gameOverlay",
        speedBar: "#speedFill",
        speedProgress: "#speedProgress",
        perfectIndicator: "#perfectIndicator",
      },
    });
    return { state, hud };
  }

  it("pauses and resumes the active round", () => {
    const { state } = createState();

    startGame();
    expect(rafCallbacks.size).toBe(1);

    flushFrames();
    expect(rafCallbacks.size).toBe(1);

    const paused = pauseGame();
    expect(paused).toBe(true);
    expect(state.isPaused).toBe(true);
    expect(state.isRunning).toBe(false);
    expect(rafCallbacks.size).toBe(0);

    flushFrames();
    expect(rafCallbacks.size).toBe(0);

    const resumed = resumeGame();
    expect(resumed).toBe(true);
    expect(state.isPaused).toBe(false);
    expect(state.isRunning).toBe(true);
    expect(rafCallbacks.size).toBe(1);
  });

  it("closes the pause menu when restarting or ending the round", () => {
    const { state, hud } = createState();
    const pauseMenu = hud?.pauseMenu;
    if (!pauseMenu) {
      throw new Error("Pause menu was not initialized");
    }
    expect(pauseMenu).toBeTruthy();

    startGame();
    flushFrames();

    expect(pauseGame()).toBe(true);
    pauseMenu.open();
    expect(pauseMenu.isVisible()).toBe(true);

    startGame();
    expect(pauseMenu.isVisible()).toBe(false);

    flushFrames();
    pauseMenu.open();
    expect(pauseMenu.isVisible()).toBe(true);

    const bird = state.bird as any;
    if (!bird) {
      throw new Error("Bird was not initialized");
    }
    bird.y = -100;
    flushFrames();
    expect(pauseMenu.isVisible()).toBe(false);
  });
});
