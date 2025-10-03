import { Bird, Pipe } from "./game/entities/index.js";
import { CONFIG, createGameState, resetGameState } from "./game/systems/index.js";
import { getWebGLUnsupportedReason, isWebGLSupported, type WebGLSupportCheck } from "./rendering/detect";

declare global {
  interface ImportMeta {
    vitest?: unknown;
  }
}

type AnimationHandle = number | null;

interface GameState {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  bird: Bird;
  pipes: Pipe[];
  score: number;
  gameOver: boolean;
  frameCount: number;
  pipeSpeed: number;
  animationFrameId: AnimationHandle;
}

let state: GameState | null = null;

function assertState(): GameState {
  if (!state) {
    throw new Error("Game state has not been initialised");
  }

  return state;
}

function createTypedState(canvas: HTMLCanvasElement): GameState {
  const baseState = createGameState(canvas);
  const context = baseState.ctx;

  if (!context) {
    throw new Error("Failed to acquire a 2D rendering context for the game canvas.");
  }

  const typedState: GameState = {
    ...baseState,
    ctx: context as CanvasRenderingContext2D,
    canvas,
    bird: new Bird(50, canvas.height / 2),
    pipes: [],
  };

  return typedState;
}

function scheduleNextFrame(currentState: GameState): void {
  currentState.animationFrameId = window.requestAnimationFrame(() => runGameLoop(currentState));
}

function runGameLoop(currentState: GameState): void {
  currentState.animationFrameId = null;
  const { ctx, canvas } = currentState;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  currentState.bird.update(CONFIG.gravity);
  currentState.bird.draw(ctx);

  for (let i = currentState.pipes.length - 1; i >= 0; i -= 1) {
    const pipe = currentState.pipes[i];
    pipe.update(
      currentState.pipeSpeed,
      currentState.bird,
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

  if (currentState.bird.isOutOfBounds(canvas.height)) {
    currentState.gameOver = true;
  }

  if (!currentState.gameOver) {
    currentState.frameCount += 1;
    scheduleNextFrame(currentState);
  } else {
    ctx.fillStyle = "#000";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 80, canvas.height / 2);
    ctx.fillText("Click to play again", canvas.width / 2 - 100, canvas.height / 2 + 40);
  }
}

function startGame(currentState: GameState): void {
  if (currentState.animationFrameId !== null) {
    window.cancelAnimationFrame(currentState.animationFrameId);
    currentState.animationFrameId = null;
  }

  resetGameState(currentState);
  currentState.bird = new Bird(50, currentState.canvas.height / 2);
  currentState.pipes.push(new Pipe(currentState.canvas.width, currentState.canvas.height, CONFIG.gapSize));
  runGameLoop(currentState);
}

function displayFallbackMessage(canvas: HTMLCanvasElement, message: string): void {
  const elementId = "webgl-fallback-message";
  let messageElement = document.getElementById(elementId);

  if (!messageElement) {
    messageElement = document.createElement("div");
    messageElement.id = elementId;
    messageElement.setAttribute("role", "status");
    messageElement.setAttribute("aria-live", "polite");
    messageElement.className = "webgl-fallback";
    canvas.insertAdjacentElement("beforebegin", messageElement);
  }

  messageElement.textContent = `${message} Loading the classic 2D renderer instead.`;
}

function initialiseClassicRenderer(canvas: HTMLCanvasElement): void {
  state = createTypedState(canvas);
  const currentState = assertState();
  currentState.canvas.dataset.renderer = "2d";

  const handleCanvasClick = () => {
    const activeState = assertState();
    if (!activeState.gameOver) {
      activeState.bird.jump();
    } else {
      startGame(activeState);
    }
  };

  canvas.addEventListener("click", handleCanvasClick);
  startGame(currentState);
}

export interface BootstrapOptions {
  detectWebGL?: WebGLSupportCheck;
}

export function bootstrapGame(options: BootstrapOptions = {}): void {
  const { detectWebGL = isWebGLSupported } = options;
  const canvas = document.getElementById("gameCanvas");

  if (!(canvas instanceof HTMLCanvasElement)) {
    console.error("Unable to locate the game canvas element.");
    return;
  }

  if (!detectWebGL()) {
    const reason = getWebGLUnsupportedReason();
    displayFallbackMessage(canvas, reason);
  }

  initialiseClassicRenderer(canvas);
}

function initialise(): void {
  bootstrapGame();
}

if (typeof window !== "undefined" && typeof document !== "undefined" && !import.meta.vitest) {
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initialise);
  } else {
    initialise();
  }
}
