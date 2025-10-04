import { ClassicGame } from './classic/Game.ts';

type PrimaryInputEvent = PointerEvent | TouchEvent | KeyboardEvent;

function resizeCanvas(canvas: HTMLCanvasElement): void {
  const container = canvas.parentElement;
  if (!container) return;
  const aspect = 512 / 288;
  const maxWidth = Math.min(window.innerWidth * 0.9, 420);
  const width = Math.max(260, maxWidth);
  const height = width * aspect;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
}

function setupInput(canvas: HTMLCanvasElement, game: ClassicGame): void {
  const handleAction = (event: PrimaryInputEvent): void => {
    event.preventDefault();
    canvas.focus();
    game.handlePrimaryAction();
  };

  canvas.addEventListener('pointerdown', handleAction);
  canvas.addEventListener('touchstart', handleAction, { passive: false });
  canvas.addEventListener(
    'keydown',
    (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (['Space', 'ArrowUp', 'KeyW'].includes(event.code)) {
        handleAction(event);
      } else if (event.code === 'KeyR') {
        event.preventDefault();
        game.handlePrimaryAction();
      }
    },
    { passive: false }
  );

  window.addEventListener(
    'keydown',
    (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (['Space', 'ArrowUp', 'KeyW'].includes(event.code)) {
        handleAction(event);
      }
    },
    { passive: false }
  );
}

window.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('gameCanvas');
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Game canvas not found');
  }

  canvas.setAttribute('role', 'application');
  canvas.setAttribute('aria-label', 'Flappy Bird playfield');
  canvas.setAttribute('tabindex', '0');

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
