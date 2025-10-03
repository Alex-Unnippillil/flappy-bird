import { Bird, Pipe, InvinciblePowerUp } from "./game/entities/index.js";
import { CONFIG, createGameState, resetGameState } from "./game/systems/index.js";

let state;

function startGame() {
  if (state.animationFrameId !== null) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }

  resetGameState(state);
  state.bird = new Bird(50, state.canvas.height / 2);
  if (state.invinciblePowerUp) {
    state.invinciblePowerUp.reset(state);
  }
  state.pipes.push(new Pipe(state.canvas.width, state.canvas.height, CONFIG.gapSize));
  runGameLoop();
}

function runGameLoop() {
  state.animationFrameId = null;
  const { ctx, canvas } = state;
  const now = performance.now();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state.invinciblePowerUp) {
    state.invinciblePowerUp.update(state, now);
  }

  state.bird.update(CONFIG.gravity);
  state.bird.draw(ctx);

  for (let i = state.pipes.length - 1; i >= 0; i -= 1) {
    const pipe = state.pipes[i];
    pipe.update(
      state.pipeSpeed,
      state.bird,
      () => {
        state.gameOver = true;
      },
      () => {
        state.score += 1;
        if (state.score > 0 && state.score % 100 === 0) {
          state.pipeSpeed += 0.5;
        }

        if (
          state.score >= state.nextInvincibilityTriggerScore &&
          state.invinciblePowerUp
        ) {
          state.invinciblePowerUp.activate(state, now);
          state.nextInvincibilityTriggerScore += CONFIG.invincibilityScoreInterval;
        }
      },
      {
        ignoreCollisions: Boolean(state.invinciblePowerUp?.isActive),
      }
    );

    pipe.draw(ctx);

    if (pipe.isOffScreen()) {
      state.pipes.splice(i, 1);
    }
  }

  if (state.frameCount % CONFIG.pipeInterval === 0) {
    state.pipes.push(new Pipe(canvas.width, canvas.height, CONFIG.gapSize));
  }

  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${state.score}`, 10, 30);

  if (state.invinciblePowerUp?.isActive) {
    const remainingSeconds = Math.ceil(
      state.invinciblePowerUp.getRemainingTime(now) / 1000
    );
    ctx.fillStyle = "#FFA000";
    ctx.font = "18px Arial";
    ctx.fillText(`Invincible: ${remainingSeconds}s`, 10, 55);
  }

  if (state.bird.isOutOfBounds(canvas.height)) {
    state.gameOver = true;
  }

  if (!state.gameOver) {
    state.frameCount += 1;
    state.animationFrameId = requestAnimationFrame(runGameLoop);
  } else {
    ctx.fillStyle = "#000";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 80, canvas.height / 2);
    ctx.fillText("Click to play again", canvas.width / 2 - 100, canvas.height / 2 + 40);
  }
}

function handleCanvasClick() {
  if (!state.gameOver) {
    state.bird.jump();
  } else {
    startGame();
  }
}

function init() {
  const canvas = document.getElementById("gameCanvas");
  state = createGameState(canvas);
  state.invinciblePowerUp = new InvinciblePowerUp({
    durationMs: CONFIG.invincibilityDurationMs,
  });
  canvas.addEventListener("click", handleCanvasClick);
  startGame();
}

window.addEventListener("DOMContentLoaded", init);
