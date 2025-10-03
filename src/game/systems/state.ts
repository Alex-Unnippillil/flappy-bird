import { Bird } from "../entities/Bird";
import type { Pipe } from "../entities/Pipe";
import {
  createPauseState,
  resetPauseState,
  type PauseState,
} from "./pause";

export const CONFIG = {
  gravity: 0.6,
  gapSize: 100,
  pipeInterval: 120,
  initialPipeSpeed: 2,
} as const;

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
  pause: PauseState;
}

export function createGameState(canvas: HTMLCanvasElement): GameState {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to acquire 2D rendering context for the game canvas.");
  }

  return {
    canvas,
    ctx,
    bird: new Bird(50, canvas.height / 2),
    pipes: [],
    score: 0,
    gameOver: false,
    frameCount: 0,
    pipeSpeed: CONFIG.initialPipeSpeed,
    animationFrameId: null,
    pause: createPauseState(),
  };
}

export function resetGameState(state: GameState): void {
  state.pipes = [];
  state.score = 0;
  state.gameOver = false;
  state.frameCount = 0;
  state.pipeSpeed = CONFIG.initialPipeSpeed;
  state.animationFrameId = null;
  resetPauseState(state.pause);
}
