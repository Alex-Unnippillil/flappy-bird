import { createDeterministicPrng } from "./prng.ts";

export const CONFIG = {
  playfieldWidth: 420,
  playfieldHeight: 640,
  gravity: 0.55,
  gapSize: 150,
  pipeIntervalMs: 1600,
  initialPipeSpeed: 2.6,
  maxPipeSpeed: 6,
  speedRampInterval: 8,
  speedRampAmount: 0.25,
  speedDecayOnRestart: 0.35,
};

export function createGameState(canvas, prng = createDeterministicPrng()) {
  canvas.width = CONFIG.playfieldWidth;
  canvas.height = CONFIG.playfieldHeight;

  let bestScore = 0;
  if (typeof window !== "undefined" && window?.localStorage) {
    const stored = window.localStorage.getItem("flappy-best");
    bestScore = Number.parseInt(stored ?? "0", 10) || 0;
  }

  return {
    canvas,
    playfieldWidth: CONFIG.playfieldWidth,
    playfieldHeight: CONFIG.playfieldHeight,
    bird: null,
    pipes: [],
    score: 0,
    bestScore,
    gameOver: false,
    awaitingStart: true,
    isRunning: false,
    frameCount: 0,
    pipeSpeed: CONFIG.initialPipeSpeed,
    animationFrameId: null,
    prng,
    lastTimestamp: null,
    spawnTimer: 0,
    ui: null,
    roundDurationMs: 0,
    sessionStats: {
      attempts: 0,
      totalScore: 0,
      totalDurationMs: 0,
      lastScore: 0,
      lastDurationMs: 0,
      bestScore: 0,
    },
  };
}

export function resetGameState(state) {
  state.pipes = [];
  state.score = 0;
  state.gameOver = false;
  state.awaitingStart = true;
  state.isRunning = false;
  state.frameCount = 0;
  state.pipeSpeed = Math.max(
    CONFIG.initialPipeSpeed,
    state.pipeSpeed - CONFIG.speedDecayOnRestart
  );
  state.animationFrameId = null;
  state.spawnTimer = 0;
  state.lastTimestamp = null;
  state.roundDurationMs = 0;
  if (state.prng && typeof state.prng.reset === "function") {
    state.prng.reset();
  }
}

export function persistBestScore(bestScore) {
  if (typeof window === "undefined" || !window?.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem("flappy-best", String(bestScore));
  } catch (error) {
    console.warn("Unable to persist best score", error);
  }
}
