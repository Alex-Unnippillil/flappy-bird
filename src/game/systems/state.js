export const CONFIG = {
  gravity: 0.6,
  gapSize: 100,
  pipeInterval: 120,
  initialPipeSpeed: 2,
  invincibilityDurationMs: 4000,
  invincibilityScoreInterval: 10,
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
    pipeSpeed: CONFIG.initialPipeSpeed,
    animationFrameId: null,
    invincibility: {
      isActive: false,
      expiresAt: 0,
    },
    nextInvincibilityTriggerScore: CONFIG.invincibilityScoreInterval,
    invinciblePowerUp: null,
  };
}

export function resetGameState(state) {
  state.pipes = [];
  state.score = 0;
  state.gameOver = false;
  state.frameCount = 0;
  state.pipeSpeed = CONFIG.initialPipeSpeed;
  state.animationFrameId = null;
  state.invincibility.isActive = false;
  state.invincibility.expiresAt = 0;
  state.nextInvincibilityTriggerScore = CONFIG.invincibilityScoreInterval;
  if (state.bird) {
    state.bird.isInvincible = false;
  }
  if (state.invinciblePowerUp) {
    state.invinciblePowerUp.reset(state);
  }
}
