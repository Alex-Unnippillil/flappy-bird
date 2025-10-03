import type { Bird } from "../entities/Bird";
import type { Pipe } from "../entities/Pipe";
import { createDeterministicPrng } from "./prng";
import type { DeterministicPRNG } from "./prng";

export interface GameState {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  bird: Bird | null;
  pipes: Pipe[];
  score: number;
  gameOver: boolean;
  frameCount: number;
  pipeSpeed: number;
  animationFrameId: number | null;
  prng: DeterministicPRNG;
}

export const CONFIG = {
  gravity: 0.6,
  gapSize: 100,
  pipeInterval: 120,
  initialPipeSpeed: 2,
} as const;

export function createGameState(canvas: HTMLCanvasElement, prng: DeterministicPRNG = createDeterministicPrng()): GameState {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to create 2D rendering context.");
  }

  return {
    canvas,
    ctx,
    bird: null,
    pipes: [],
    score: 0,
    gameOver: false,
    frameCount: 0,
    pipeSpeed: CONFIG.initialPipeSpeed,
    animationFrameId: null,
    prng,
  };
}

export function resetGameState(state: GameState): void {
  state.pipes = [];
  state.score = 0;
  state.gameOver = false;
  state.frameCount = 0;
  state.pipeSpeed = CONFIG.initialPipeSpeed;
  state.animationFrameId = null;
  if (typeof state.prng.reset === "function") {
    state.prng.reset();
  }
}
