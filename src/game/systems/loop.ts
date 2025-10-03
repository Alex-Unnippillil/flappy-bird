import { Bird, Pipe } from "../entities";
import { CONFIG, resetGameState } from "./state";
import type { GameState } from "./state";

let activeState: GameState | null = null;

function requireState(): GameState {
  if (!activeState) {
    throw new Error("Game state has not been initialized.");
  }

  return activeState;
}

export function initializeGameLoop(gameState: GameState): void {
  activeState = gameState;
  startGame();
}

export function startGame(): void {
  const state = requireState();

  if (state.animationFrameId !== null) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }

  resetGameState(state);
  state.bird = new Bird(50, state.canvas.height / 2);
  state.pipes.push(new Pipe(state.canvas.width, state.canvas.height, CONFIG.gapSize, state.prng));
  runGameLoop();
}

function runGameLoop(): void {
  const state = requireState();

  state.animationFrameId = null;
  const { ctx, canvas } = state;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  state.bird?.update(CONFIG.gravity);
  if (state.bird) {
    state.bird.draw(ctx);
  }

  for (let i = state.pipes.length - 1; i >= 0; i -= 1) {
    const pipe = state.pipes[i];
    const bird = state.bird;
    if (!bird) {
      continue;
    }

    pipe.update(
      state.pipeSpeed,
      bird,
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
    state.pipes.push(new Pipe(canvas.width, canvas.height, CONFIG.gapSize, state.prng));
  }

  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${state.score}`, 10, 30);

  if (state.bird?.isOutOfBounds(canvas.height)) {
    state.gameOver = true;
  }

  if (!state.gameOver) {
    state.frameCount += 1;
    state.animationFrameId = requestAnimationFrame(runGameLoop);
  } else {
    ctx.fillStyle = "#000";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 80, canvas.height / 2);
    ctx.fillText("Click or press space to play again", canvas.width / 2 - 170, canvas.height / 2 + 40);
  }
}

export function handleCanvasClick(): void {
  const state = requireState();

  if (!state.bird) {
    return;
  }

  if (!state.gameOver) {
    state.bird.jump();
  } else {
    startGame();
  }
}
