import type { Bird } from '../entities/Bird.js';
import type { Pipe } from '../entities/Pipe.js';

export interface GameState {
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

export const CONFIG: {
  gravity: number;
  gapSize: number;
  pipeInterval: number;
  initialPipeSpeed: number;
};

export function createGameState(canvas: HTMLCanvasElement): GameState;
export function resetGameState(state: GameState): void;
