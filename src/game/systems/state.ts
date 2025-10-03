import { Bird } from "../entities/Bird";
import type { Pipe } from "../entities/Pipe";

export const CONFIG = {
  gravity: 0.6,
  gapSize: 100,
  pipeInterval: 120,
  initialPipeSpeed: 2,
  groundHeight: 72,
};

export interface GameState {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  bird: Bird;
  pipes: Pipe[];
  score: number;
  gameOver: boolean;
  frameCount: number;
  pipeSpeed: number;
  animationFrameId: number | null;
  groundHeight: number;
  viewportWidth: number;
  viewportHeight: number;
}

function resolveViewportDimensions(canvas: HTMLCanvasElement): {
  width: number;
  height: number;
} {
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;

  return {
    width,
    height,
  };
}

export function createGameState(canvas: HTMLCanvasElement): GameState {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Unable to acquire 2D rendering context");
  }

  const { width, height } = resolveViewportDimensions(canvas);

  return {
    canvas,
    ctx,
    bird: new Bird(50, height / 2),
    pipes: [],
    score: 0,
    gameOver: false,
    frameCount: 0,
    pipeSpeed: CONFIG.initialPipeSpeed,
    animationFrameId: null,
    groundHeight: CONFIG.groundHeight,
    viewportWidth: width,
    viewportHeight: height,
  };
}

export function resetGameState(state: GameState): void {
  state.pipes = [];
  state.score = 0;
  state.gameOver = false;
  state.frameCount = 0;
  state.pipeSpeed = CONFIG.initialPipeSpeed;
  state.animationFrameId = null;
  state.bird = new Bird(50, state.viewportHeight / 2);
}

export function updateViewportDimensions(state: GameState): void {
  const { width, height } = resolveViewportDimensions(state.canvas);
  state.viewportWidth = width;
  state.viewportHeight = height;
}
