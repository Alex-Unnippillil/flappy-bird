import { Bird, Pipe } from './game/entities/index.js';
import { CONFIG, createGameState, resetGameState } from './game/systems/index.js';
import { theme } from './config';
import { createRenderer } from './rendering/index';
import type { GameState } from './game/systems/state.js';
import type { Renderer } from './rendering/types';

let state: GameState;
let renderer: Renderer;

function handleCollision(): void {
  state.gameOver = true;
}

function handleScoredPoint(): void {
  state.score += 1;
  if (state.score > 0 && state.score % 100 === 0) {
    state.pipeSpeed += 0.5;
  }
}

function updatePipes(): void {
  const bird = state.bird;
  if (!bird) {
    throw new Error('Bird must be initialized before updating pipes.');
  }

  for (let i = state.pipes.length - 1; i >= 0; i -= 1) {
    const pipe = state.pipes[i];
    pipe.update(state.pipeSpeed, bird, handleCollision, handleScoredPoint);

    if (pipe.isOffScreen()) {
      state.pipes.splice(i, 1);
    }
  }
}

function maybeSpawnPipe(): void {
  if (state.frameCount % CONFIG.pipeInterval === 0) {
    state.pipes.push(new Pipe(state.canvas.width, state.canvas.height, CONFIG.gapSize));
  }
}

function ensureBirdInBounds(): void {
  const bird = state.bird;
  if (!bird) {
    throw new Error('Bird must be initialized before checking bounds.');
  }

  if (bird.isOutOfBounds(state.canvas.height)) {
    state.gameOver = true;
  }
}

function runGameLoop(): void {
  state.animationFrameId = null;

  const bird = state.bird;
  if (!bird) {
    throw new Error('Bird must be initialized before starting the game loop.');
  }

  bird.update(CONFIG.gravity);
  updatePipes();
  maybeSpawnPipe();
  ensureBirdInBounds();

  renderer.renderFrame(state);

  if (!state.gameOver) {
    state.frameCount += 1;
    state.animationFrameId = requestAnimationFrame(runGameLoop);
  }
}

function stopExistingLoop(): void {
  if (state.animationFrameId !== null) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }
}

function startGame(): void {
  stopExistingLoop();
  resetGameState(state);

  state.bird = new Bird(50, state.canvas.height / 2);
  state.pipes.push(new Pipe(state.canvas.width, state.canvas.height, CONFIG.gapSize));

  renderer.renderFrame(state);
  runGameLoop();
}

function handleCanvasClick(): void {
  if (!state.bird) {
    return;
  }

  if (!state.gameOver) {
    state.bird.jump();
  } else {
    startGame();
  }
}

function init(): void {
  const canvas = document.getElementById('gameCanvas');
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Unable to locate the game canvas element.');
  }

  state = createGameState(canvas);
  renderer = createRenderer(theme);
  renderer.setup(state);

  if (!state.ctx) {
    throw new Error('Failed to obtain a 2D rendering context for the game canvas.');
  }

  canvas.addEventListener('click', handleCanvasClick);
  startGame();
}

window.addEventListener('DOMContentLoaded', init);
