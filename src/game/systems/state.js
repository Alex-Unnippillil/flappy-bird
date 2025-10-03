export const CONFIG = {
  gravity: 0.6,
  gapSize: 100,
  pipeInterval: 120,
  initialPipeSpeed: 2,
};

export function createGameState(canvas) {
  return {
    canvas,
    ctx: canvas.getContext("2d"),
    bird: null,
    pipes: [],
    score: 0,
    gameOver: false,
    frameCount: 0,
    framesSinceLastSpawn: 0,
    pipeSpeed: CONFIG.initialPipeSpeed,
    startTimestamp: 0,
    animationFrameId: null,
  };
}

export function resetGameState(state) {
  state.pipes = [];
  state.score = 0;
  state.gameOver = false;
  state.frameCount = 0;
  state.framesSinceLastSpawn = 0;
  state.pipeSpeed = CONFIG.initialPipeSpeed;
  state.startTimestamp = 0;
  state.animationFrameId = null;
}
