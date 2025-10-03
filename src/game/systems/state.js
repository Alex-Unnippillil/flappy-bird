import { Ground } from "../entities/ground.ts";

export const CONFIG = {
  gravity: 0.6,
  gapSize: 100,
  pipeInterval: 120,
  initialPipeSpeed: 2,
  groundHeight: 80,
  groundTileWidth: 128,
};

export function createGameState(canvas) {
  const ground = new Ground(canvas.width, canvas.height, {
    height: CONFIG.groundHeight,
    tileWidth: CONFIG.groundTileWidth,
    initialScrollSpeed: CONFIG.initialPipeSpeed,
  });

  return {
    canvas,
    ctx: canvas.getContext("2d"),
    bird: null,
    pipes: [],
    ground,
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
  state.ground.reset(CONFIG.initialPipeSpeed);
  state.animationFrameId = null;
}
