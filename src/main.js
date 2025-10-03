import { Bird, Pipe } from "./game/entities/index.js";
import { CONFIG, createGameState, resetGameState } from "./game/systems/index.js";
import { configureCanvas2D } from "./rendering/canvas2d.ts";

let state;

function startGame() {
  if (state.animationFrameId !== null) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }

  resetGameState(state);
  state.bird = new Bird(50, state.height / 2);
  state.pipes.push(new Pipe(state.width, state.height, CONFIG.gapSize));
  runGameLoop();
}

function runGameLoop() {
  state.animationFrameId = null;
  const { ctx } = state;

  ctx.clearRect(0, 0, state.width, state.height);

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
      }
    );

    pipe.draw(ctx);

    if (pipe.isOffScreen()) {
      state.pipes.splice(i, 1);
    }
  }

  if (state.frameCount % CONFIG.pipeInterval === 0) {
    state.pipes.push(new Pipe(state.width, state.height, CONFIG.gapSize));
  }

  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${state.score}`, 10, 30);

  if (state.bird.isOutOfBounds(state.height)) {
    state.gameOver = true;
  }

  if (!state.gameOver) {
    state.frameCount += 1;
    state.animationFrameId = requestAnimationFrame(runGameLoop);
  } else {
    ctx.fillStyle = "#000";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", state.width / 2 - 80, state.height / 2);
    ctx.fillText("Click to play again", state.width / 2 - 100, state.height / 2 + 40);
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
  const { ctx, width, height, pixelRatio } = configureCanvas2D(canvas);

  state = createGameState(canvas, ctx, { width, height, pixelRatio });
  canvas.addEventListener("click", handleCanvasClick);
  startGame();
}

window.addEventListener("DOMContentLoaded", init);
