import { ClassicGame } from './classic/Game';

const BASE_CANVAS_ASPECT = 512 / 288;
const MIN_CANVAS_WIDTH = 260;
const MAX_CANVAS_WIDTH = 420;
const WIDTH_VIEWPORT_RATIO = 0.9;

function resizeCanvas(canvas: HTMLCanvasElement): void {
  const container = canvas.parentElement;
  if (!container) {
    return;
  }

  const availableWidth = window.innerWidth * WIDTH_VIEWPORT_RATIO;
  const width = Math.max(MIN_CANVAS_WIDTH, Math.min(availableWidth, MAX_CANVAS_WIDTH));
  const height = width * BASE_CANVAS_ASPECT;

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
}

function setupInput(canvas: HTMLCanvasElement, game: ClassicGame): void {
  const handleAction = (event: Event): void => {
    event.preventDefault();
    if (typeof canvas.focus === 'function') {
      canvas.focus();
    }
    game.handlePrimaryAction();
  };

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat) {
      return;
    }

    if (['Space', 'ArrowUp', 'KeyW'].includes(event.code)) {
      handleAction(event);
    } else if (event.code === 'KeyR') {
      event.preventDefault();
      game.handlePrimaryAction();
    }
  };

  canvas.addEventListener('pointerdown', handleAction);
  canvas.addEventListener('touchstart', handleAction, { passive: false });
  canvas.addEventListener('keydown', handleKeyDown, { passive: false });

  window.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.repeat) {
      return;
    }
    if (['Space', 'ArrowUp', 'KeyW'].includes(event.code)) {
      handleAction(event);
    }
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('gameCanvas');
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Game canvas not found');
  }

  canvas.setAttribute('role', 'application');
  canvas.setAttribute('aria-label', 'Flappy Bird playfield');
  canvas.tabIndex = 0;

  resizeCanvas(canvas);

  const game = new ClassicGame(canvas, {
    score: '#scoreValue',
    best: '#bestValue',
    overlay: '#gameOverlay',
    message: '#gameMessage',
    startButton: '#startButton',
  });
  await game.init();

  setupInput(canvas, game);
  window.addEventListener('resize', () => {
    resizeCanvas(canvas);
  });
});
