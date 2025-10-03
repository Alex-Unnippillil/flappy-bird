import { Bird, Pipe } from "./game/entities/index.js";
import { CONFIG, createGameState, resetGameState } from "./game/systems/index.js";
import { setupKeyboardControls } from "./input/keyboard.ts";

let state;
let removeKeyboardControls;

function updateGame() {
  const { canvas } = state;

  state.bird.update(CONFIG.gravity);

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

    if (pipe.isOffScreen()) {
      state.pipes.splice(i, 1);
    }
  }

  if (!state.gameOver && state.frameCount % CONFIG.pipeInterval === 0) {
    state.pipes.push(new Pipe(canvas.width, canvas.height, CONFIG.gapSize));
  }

  if (state.bird.isOutOfBounds(canvas.height)) {
    state.gameOver = true;
  }

  if (!state.gameOver) {
    state.frameCount += 1;
  }
}

function renderFrame() {
  const { ctx, canvas } = state;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < state.pipes.length; i += 1) {
    state.pipes[i].draw(ctx);
  }

  state.bird.draw(ctx);

  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`Score: ${state.score}`, 10, 30);

  if (state.gameOver) {
    ctx.textAlign = "center";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Press R or click to restart", canvas.width / 2, canvas.height / 2 + 40);
    ctx.textAlign = "left";
  } else if (state.isPaused) {
    ctx.textAlign = "center";
    ctx.font = "30px Arial";
    ctx.fillText("Paused", canvas.width / 2, canvas.height / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Press P to resume", canvas.width / 2, canvas.height / 2 + 40);
    ctx.textAlign = "left";
  }
}

function startGame() {
  if (state.animationFrameId !== null) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }

  resetGameState(state);
  state.bird = new Bird(50, state.canvas.height / 2);
  state.pipes.push(new Pipe(state.canvas.width, state.canvas.height, CONFIG.gapSize));
  state.isPaused = false;
  runGameLoop();
}

function runGameLoop() {
  if (!state.isPaused && !state.gameOver) {
    updateGame();
  }

  renderFrame();

  if (!state.gameOver) {
    state.animationFrameId = requestAnimationFrame(runGameLoop);
  } else {
    state.animationFrameId = null;
  }
}

function handleCanvasClick() {
  state.canvas.focus();

  if (state.gameOver) {
    startGame();
  } else if (!state.isPaused) {
    state.bird.jump();
  }
}

function handleFlapInput() {
  if (!state.gameOver && !state.isPaused) {
    state.bird.jump();
  }
}

function handleTogglePause() {
  if (state.gameOver) {
    return;
  }

  state.isPaused = !state.isPaused;
}

function handleRestart() {
  state.canvas.focus();
  startGame();
}

function init() {
  const canvas = document.getElementById("gameCanvas");

  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("Game canvas element not found");
  }

  state = createGameState(canvas);
  canvas.addEventListener("click", handleCanvasClick);
  removeKeyboardControls = setupKeyboardControls(canvas, {
    onFlap: handleFlapInput,
    onTogglePause: handleTogglePause,
    onRestart: handleRestart,
  });
  canvas.focus();
  startGame();
}

window.addEventListener("DOMContentLoaded", init);

window.addEventListener("beforeunload", () => {
  if (typeof removeKeyboardControls === "function") {
    removeKeyboardControls();
  }
});
