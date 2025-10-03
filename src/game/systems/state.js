import { gameConfig, onMotionPreferenceChange } from "../../config.ts";

export const CONFIG = gameConfig;

const motionAwareStates = new Set();

function applyMotionScaleToState(state, { rescaleTimer = true } = {}) {
  const previousScale = state.motionScale ?? CONFIG.motionScale;
  const nextScale = CONFIG.motionScale;

  if (rescaleTimer && typeof state.pipeSpawnTimer === "number" && previousScale > 0) {
    state.pipeSpawnTimer = (state.pipeSpawnTimer / previousScale) * nextScale;
  }

  state.motionScale = nextScale;
}

export function createGameState(canvas) {
  const state = {
    canvas,
    ctx: canvas.getContext("2d"),
    bird: null,
    pipes: [],
    score: 0,
    gameOver: false,
    pipeSpawnTimer: CONFIG.pipeInterval,
    pipeSpeed: CONFIG.initialPipeSpeed,
    animationFrameId: null,
    motionScale: CONFIG.motionScale,
  };

  motionAwareStates.add(state);
  return state;
}

export function resetGameState(state) {
  state.pipes = [];
  state.score = 0;
  state.gameOver = false;
  state.pipeSpawnTimer = CONFIG.pipeInterval;
  state.pipeSpeed = CONFIG.initialPipeSpeed;
  state.animationFrameId = null;
  applyMotionScaleToState(state, { rescaleTimer: false });
}

onMotionPreferenceChange(() => {
  motionAwareStates.forEach((state) => {
    applyMotionScaleToState(state);
  });
});
