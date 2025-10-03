import type { Bird } from '../game/entities/Bird.js';
import type { GameState } from '../game/systems/state.js';
import type { Renderer } from './types';

function assertRenderableState(state: GameState): asserts state is GameState & {
  ctx: CanvasRenderingContext2D;
  bird: Bird;
} {
  if (!state.ctx) {
    throw new Error('3D renderer requires an initialized 2D rendering context.');
  }

  if (!state.bird) {
    throw new Error('3D renderer requires a bird entity before rendering a frame.');
  }
}

function drawBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#0b1d26');
  gradient.addColorStop(1, '#1d4e89');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function draw3dPipe(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  lightColor: string,
  shadowColor: string,
) {
  const gradient = ctx.createLinearGradient(x, y, x + width, y + width);
  gradient.addColorStop(0, lightColor);
  gradient.addColorStop(1, shadowColor);

  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y, width - 2, height);
}

function draw3dBird(ctx: CanvasRenderingContext2D, bird: Bird) {
  const centerX = bird.x + bird.width / 2;
  const centerY = bird.y + bird.height / 2;
  const radiusX = bird.width / 1.6;
  const radiusY = bird.height / 1.4;

  const bodyGradient = ctx.createRadialGradient(
    centerX - radiusX / 2,
    centerY - radiusY / 2,
    Math.max(radiusX, radiusY) / 8,
    centerX,
    centerY,
    Math.max(radiusX, radiusY),
  );
  bodyGradient.addColorStop(0, '#ffd166');
  bodyGradient.addColorStop(1, '#f3722c');

  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fillStyle = bodyGradient;
  ctx.fill();
  ctx.closePath();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(centerX + radiusX / 2.5, centerY - radiusY / 3, radiusX / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(centerX + radiusX / 2.8, centerY - radiusY / 3, radiusX / 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();

  ctx.fillStyle = '#f94144';
  ctx.beginPath();
  ctx.moveTo(centerX + radiusX, centerY);
  ctx.lineTo(centerX + radiusX + 8, centerY + 4);
  ctx.lineTo(centerX + radiusX + 8, centerY - 4);
  ctx.fill();
  ctx.closePath();
}

function drawHud(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, score: number) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = 'bold 22px "Trebuchet MS", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${score}`, 16, 36);
  ctx.textAlign = 'start';
}

function drawGameOverOverlay(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  ctx.fillStyle = 'rgba(10, 15, 35, 0.75)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffe066';
  ctx.font = 'bold 34px "Trebuchet MS", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 12);
  ctx.font = '22px "Trebuchet MS", Arial, sans-serif';
  ctx.fillText('Click to try again', canvas.width / 2, canvas.height / 2 + 22);
  ctx.textAlign = 'start';
}

export function create3dRenderer(): Renderer {
  return {
    setup(state) {
      state.canvas.dataset.theme = '3d';
      state.canvas.style.background = 'linear-gradient(180deg, #0b1d26 0%, #1d4e89 100%)';
    },
    renderFrame(state) {
      assertRenderableState(state);
      const { canvas, ctx, bird } = state;

      drawBackground(ctx, canvas);

      state.pipes.forEach((pipe) => {
        draw3dPipe(ctx, pipe.x, 0, pipe.width, pipe.topHeight, '#80ed99', '#22577a');
        const bottomY = pipe.topHeight + pipe.gapSize;
        const bottomHeight = pipe.canvasHeight - bottomY;
        draw3dPipe(ctx, pipe.x, bottomY, pipe.width, bottomHeight, '#38a3a5', '#22577a');
      });

      draw3dBird(ctx, bird);
      drawHud(ctx, canvas, state.score);

      if (state.gameOver) {
        drawGameOverOverlay(ctx, canvas);
      }
    },
  } satisfies Renderer;
}
