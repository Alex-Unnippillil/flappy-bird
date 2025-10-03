import { Bird, Pipe } from "./game/entities";
import {
  CONFIG,
  createGameState,
  isPaused,
  requestStep,
  resetGameState,
  shouldProcessFrame,
  togglePause,
  type GameState,
} from "./game/systems";

const PAUSE_KEY = "KeyP";
const STEP_KEY = "KeyO";

let state: GameState;

function updateGame(): void {
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
}

function renderGame(): void {
  const { ctx, canvas } = state;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  state.bird.draw(ctx);

  for (const pipe of state.pipes) {
    pipe.draw(ctx);
  }

  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${state.score}`, 10, 30);

  if (state.gameOver) {
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 80, canvas.height / 2);
    ctx.fillText("Click to play again", canvas.width / 2 - 100, canvas.height / 2 + 40);
    return;
  }

  if (isPaused(state.pause)) {
    ctx.font = "24px Arial";
    ctx.fillText("Paused", canvas.width / 2 - 50, canvas.height / 2);
    ctx.font = "16px Arial";
    ctx.fillText("Press P to resume", canvas.width / 2 - 80, canvas.height / 2 + 24);
    ctx.fillText("Press O to step", canvas.width / 2 - 70, canvas.height / 2 + 44);
  }
}

function runGameLoop(): void {
  state.animationFrameId = null;

  const processedFrame = !state.gameOver && shouldProcessFrame(state.pause);
  if (processedFrame) {
    updateGame();
  }

  renderGame();

  if (!state.gameOver) {
    if (processedFrame) {
      state.frameCount += 1;
    }
    state.animationFrameId = requestAnimationFrame(runGameLoop);
  }
}

function startGame(): void {
  if (state.animationFrameId !== null) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }

  resetGameState(state);
  state.bird = new Bird(50, state.canvas.height / 2);
  state.pipes.push(new Pipe(state.canvas.width, state.canvas.height, CONFIG.gapSize));
  runGameLoop();
}

function handleCanvasClick(): void {
  if (state.gameOver) {
    startGame();
    return;
  }

  state.bird.jump();
}

function handleKeyDown(event: KeyboardEvent): void {
  if (!state || state.gameOver) {
    return;
  }

  if (event.code === PAUSE_KEY) {
    event.preventDefault();
    togglePause(state.pause);
  } else if (event.code === STEP_KEY) {
    event.preventDefault();
    requestStep(state.pause);
  } else if (event.code === "Space") {
    event.preventDefault();
    state.bird.jump();
  }
}

function init(): void {
  const canvas = document.getElementById("gameCanvas");
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("Game canvas element not found.");
  }

  state = createGameState(canvas);
  canvas.addEventListener("click", handleCanvasClick);
  document.addEventListener("keydown", handleKeyDown);
  startGame();
}

window.addEventListener("DOMContentLoaded", init);
