import { Bird, Pipe } from "./game/entities/index.js";
import {
  CONFIG,
  createGameState,
  getGapSize,
  getPipeSpeed,
  getSpawnInterval,
  resetGameState,
} from "./game/systems/index.js";

let state;

function startGame() {
  if (state.animationFrameId !== null) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }

  resetGameState(state);
  state.startTimestamp = performance.now();
  state.bird = new Bird(50, state.canvas.height / 2);

  const initialGap = getGapSize(state.score, 0);
  state.pipes.push(new Pipe(state.canvas.width, state.canvas.height, initialGap));
  state.framesSinceLastSpawn = 0;
  runGameLoop();
}

function runGameLoop() {
  state.animationFrameId = null;
  const { ctx, canvas } = state;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  state.bird.update(CONFIG.gravity);
  state.bird.draw(ctx);

  const elapsedSeconds = (performance.now() - state.startTimestamp) / 1000;
  const gapSize = getGapSize(state.score, elapsedSeconds);
  const spawnInterval = getSpawnInterval(state.score, elapsedSeconds);
  state.pipeSpeed = getPipeSpeed(state.score, elapsedSeconds);

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
      },
    );

    pipe.draw(ctx);

    if (pipe.isOffScreen()) {
      state.pipes.splice(i, 1);
    }
  }

  state.framesSinceLastSpawn += 1;
  if (state.framesSinceLastSpawn >= spawnInterval) {
    state.pipes.push(new Pipe(canvas.width, canvas.height, gapSize));
    state.framesSinceLastSpawn = 0;
  }

  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${state.score}`, 10, 30);

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
  canvas.addEventListener("click", handleCanvasClick);
  startGame();
}

window.addEventListener("DOMContentLoaded", init);
