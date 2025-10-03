import type { Bird } from '../game/entities/Bird.js';
import type { GameState } from '../game/systems/state.js';
import type { Renderer } from './types';

function assertRenderableState(state: GameState): asserts state is GameState & {
  ctx: CanvasRenderingContext2D;
  bird: Bird;
} {
  if (!state.ctx) {
    throw new Error('2D renderer requires an initialized 2D rendering context.');
  }

  if (!state.bird) {
    throw new Error('2D renderer requires a bird entity before rendering a frame.');
  }
}

function drawGameOverOverlay(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffffff';
  ctx.font = '30px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = '20px Arial';
  ctx.fillText('Click to play again', canvas.width / 2, canvas.height / 2 + 20);
  ctx.textAlign = 'start';
}

export function create2dRenderer(): Renderer {
  return {
    setup(state) {
      state.canvas.dataset.theme = '2d';
      state.canvas.style.background = '#87ceeb';
    },
    renderFrame(state) {
      assertRenderableState(state);
      const { canvas, ctx, bird } = state;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      state.pipes.forEach((pipe) => {
        pipe.draw(ctx);
      });

      bird.draw(ctx);

      ctx.fillStyle = '#000000';
      ctx.font = '20px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${state.score}`, 10, 30);
      ctx.textAlign = 'start';

      if (state.gameOver) {
        drawGameOverOverlay(ctx, canvas);
      }
    },
  } satisfies Renderer;
}
