import { Bird, Pipe } from "./game/entities/index.js";
import { CONFIG, createGameState, resetGameState } from "./game/systems/index.js";

interface GameState {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  bird: Bird | null;
  pipes: Pipe[];
  score: number;
  gameOver: boolean;
  frameCount: number;
  pipeSpeed: number;
  animationFrameId: number | null;
}

let state: GameState | null = null;

function startGame(): void {
  const currentState = state;
  if (!currentState) {
    return;
  }

  if (currentState.animationFrameId !== null) {
    cancelAnimationFrame(currentState.animationFrameId);
    currentState.animationFrameId = null;
  }

  resetGameState(currentState);
  currentState.bird = new Bird(50, currentState.canvas.height / 2);
  currentState.pipes.push(
    new Pipe(currentState.canvas.width, currentState.canvas.height, CONFIG.gapSize)
  );
  runGameLoop();
}

function runGameLoop(): void {
  const currentState = state;
  if (!currentState || !currentState.ctx || !currentState.bird) {
    return;
  }

  currentState.animationFrameId = null;
  const { ctx, canvas, bird } = currentState;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bird.update(CONFIG.gravity);
  bird.draw(ctx);

  for (let i = currentState.pipes.length - 1; i >= 0; i -= 1) {
    const pipe = currentState.pipes[i];
    pipe.update(
      currentState.pipeSpeed,
      bird,
      () => {
        currentState.gameOver = true;
      },
      () => {
        currentState.score += 1;
        if (currentState.score > 0 && currentState.score % 100 === 0) {
          currentState.pipeSpeed += 0.5;
        }
      }
    );

    pipe.draw(ctx);

    if (pipe.isOffScreen()) {
      currentState.pipes.splice(i, 1);
    }
  }

  if (currentState.frameCount % CONFIG.pipeInterval === 0) {
    currentState.pipes.push(new Pipe(canvas.width, canvas.height, CONFIG.gapSize));
  }

  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${currentState.score}`, 10, 30);

  if (bird.isOutOfBounds(canvas.height)) {
    currentState.gameOver = true;
  }

  if (!currentState.gameOver) {
    currentState.frameCount += 1;
    currentState.animationFrameId = requestAnimationFrame(runGameLoop);
  } else {
    ctx.fillStyle = "#000";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 80, canvas.height / 2);
    ctx.fillText("Click to play again", canvas.width / 2 - 100, canvas.height / 2 + 40);
  }
}

function handleCanvasClick(): void {
  const currentState = state;
  if (!currentState || !currentState.bird) {
    return;
  }

  if (!currentState.gameOver) {
    currentState.bird.jump();
  } else {
    startGame();
  }
}

export function initializeGame(canvasId = "gameCanvas"): void {
  const canvasElement = document.getElementById(canvasId);

  if (!(canvasElement instanceof HTMLCanvasElement)) {
    throw new Error(`Canvas element with id "${canvasId}" was not found.`);
  }

  const baseState = createGameState(canvasElement) as GameState;
  const ctx = baseState.ctx;

  if (!ctx) {
    throw new Error("Unable to access 2D rendering context for the game canvas.");
  }

  state = {
    ...baseState,
    canvas: canvasElement,
    ctx,
    bird: baseState.bird ?? null,
    pipes: baseState.pipes ?? [],
    animationFrameId: null,
  };

  canvasElement.addEventListener("click", handleCanvasClick);
  startGame();
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", () => {
    initializeGame();
  });
} else {
  initializeGame();
}
