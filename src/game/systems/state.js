export const CONFIG = {
  gravity: 0.6,
  gapSize: 100,
  pipeInterval: 120,
  initialPipeSpeed: 2,
};

export function createGameState(canvas, ctx, dimensions) {
  const { width, height, pixelRatio } = dimensions;

  return {
    canvas,
    ctx,
    width,
    height,
    pixelRatio,
    bird: null,
    pipes: [],
    score: 0,
    gameOver: false,
    frameCount: 0,
    pipeSpeed: CONFIG.initialPipeSpeed,
    animationFrameId: null,
  };
}

export function resetGameState(state) {
  state.pipes = [];
  state.score = 0;
  state.gameOver = false;
  state.frameCount = 0;
  state.pipeSpeed = CONFIG.initialPipeSpeed;
  state.animationFrameId = null;
}
