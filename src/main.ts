import { GameLoop } from './game/loop';

const PRIMARY_KEY_CODES = new Set(['Space', 'ArrowUp', 'KeyW']);

function createHud(): { score: HTMLDivElement; message: HTMLDivElement; liveRegion: HTMLDivElement } {
  const score = document.createElement('div');
  score.id = 'hud-score';
  score.textContent = 'Score: 0';
  score.setAttribute('aria-hidden', 'true');

  const message = document.createElement('div');
  message.id = 'hud-message';
  message.textContent = 'Tap or press space to start';

  const liveRegion = document.createElement('div');
  liveRegion.id = 'hud-live-region';
  liveRegion.className = 'sr-only';
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.textContent = 'Game ready';

  document.body.appendChild(score);
  document.body.appendChild(message);
  document.body.appendChild(liveRegion);

  return { score, message, liveRegion };
}

function updateMessage(messageEl: HTMLDivElement, state: ReturnType<GameLoop['getState']>): void {
  switch (state) {
    case 'running':
      messageEl.classList.remove('visible');
      messageEl.textContent = '';
      break;
    case 'gameOver':
      messageEl.textContent = 'Game over – tap or press space to try again';
      messageEl.classList.add('visible');
      break;
    case 'ready':
    default:
      messageEl.textContent = 'Tap or press space to flap';
      messageEl.classList.add('visible');
      break;
  }
}

function bindInputs(loop: GameLoop, canvas: HTMLCanvasElement, liveRegion: HTMLDivElement): void {
  const handlePrimary = () => {
    loop.handlePrimaryAction();
  };

  const pointerHandler = (event: PointerEvent) => {
    event.preventDefault();
    if (document.activeElement !== canvas) {
      canvas.focus();
    }
    handlePrimary();
  };

  canvas.addEventListener('pointerdown', pointerHandler);

  const keyHandler = (event: KeyboardEvent) => {
    if (event.repeat) {
      return;
    }

    if (PRIMARY_KEY_CODES.has(event.code)) {
      event.preventDefault();
      handlePrimary();
      return;
    }

    if (event.code === 'Enter' && loop.getState() === 'gameOver') {
      event.preventDefault();
      handlePrimary();
    }
  };

  window.addEventListener('keydown', keyHandler);

  const visibilityHandler = () => {
    if (document.visibilityState === 'hidden') {
      liveRegion.textContent = 'Paused';
    } else {
      liveRegion.textContent = `Score ${loop.getScore()}`;
    }
  };

  document.addEventListener('visibilitychange', visibilityHandler);
}

async function bootstrap(): Promise<void> {
  const canvas = document.getElementById('gameCanvas');
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Game canvas element not found');
  }

  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Flappy Bird game canvas. Tap or press space to flap.');

  const hud = createHud();
  const loop = new GameLoop({ canvas });
  await loop.ready;

  bindInputs(loop, canvas, hud.liveRegion);

  loop.onScore((score) => {
    hud.score.textContent = `Score: ${score}`;
    if (loop.getState() !== 'gameOver') {
      hud.liveRegion.textContent = `Score ${score}`;
    }
  });

  loop.onStateChange((state) => {
    updateMessage(hud.message, state);
    if (state === 'ready') {
      hud.liveRegion.textContent = 'Game ready. Tap or press space to start';
    }
    if (state === 'gameOver') {
      hud.liveRegion.textContent = 'Game over';
    }
    if (state === 'running') {
      hud.liveRegion.textContent = `Score ${loop.getScore()}`;
    }
  });

  updateMessage(hud.message, loop.getState());
}

void bootstrap();
