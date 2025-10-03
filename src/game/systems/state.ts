import type { Bird, HUD, Pipe } from "../entities";

export const CONFIG = {
  gravity: 0.6,
  gapSize: 100,
  pipeInterval: 120,
  initialPipeSpeed: 2,
};

export interface GameState {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  bird: Bird | null;
  pipes: Pipe[];
  score: number;
  bestScore: number;
  gameOver: boolean;
  frameCount: number;
  pipeSpeed: number;
  animationFrameId: number | null;
  paused: boolean;
  fpsEnabled: boolean;
  lastTimestamp: number | null;
  hud: HUD;
  fps: number;
}

export function createGameState(canvas: HTMLCanvasElement, hud: HUD): GameState {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to initialise game: 2D context is unavailable.");
  }

  return {
    canvas,
    ctx,
    bird: null,
    pipes: [],
    score: 0,
    bestScore: hud.getBestScore(),
    gameOver: false,
    frameCount: 0,
    pipeSpeed: CONFIG.initialPipeSpeed,
    animationFrameId: null,
    paused: false,
    fpsEnabled: false,
    lastTimestamp: null,
    hud,
    fps: 0,
  };
}

export function resetGameState(state: GameState): void {
  state.pipes = [];
  state.score = 0;
  state.bestScore = state.hud.getBestScore();
  state.gameOver = false;
  state.frameCount = 0;
  state.pipeSpeed = CONFIG.initialPipeSpeed;
  state.animationFrameId = null;
  state.paused = false;
  state.fpsEnabled = state.hud.getFpsEnabled();
  state.lastTimestamp = null;
  state.fps = 0;
}
