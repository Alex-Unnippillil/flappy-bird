import "./style.css";
import {
  createGameState,
  handleCanvasClick,
  initializeGameLoop,
  startGame,
} from "./game/systems";

type MountResult = {
  destroy(): void;
};

function mountGameShell(container: HTMLElement): MountResult {
  container.innerHTML = `
    <main class="game-shell" aria-labelledby="game-shell-title">
      <header class="game-shell__header">
        <h1 id="game-shell-title" class="game-shell__title">Flappy Bird</h1>
        <p class="game-shell__subtitle">Tap, click, or press space to keep your bird aloft.</p>
      </header>
      <div class="game-shell__canvas-wrapper">
        <canvas
          id="game-canvas"
          class="game-shell__canvas"
          width="400"
          height="400"
          role="img"
          aria-label="Flappy Bird gameplay area"
          tabindex="0"
        ></canvas>
      </div>
      <div class="game-shell__actions">
        <button type="button" class="game-shell__button" data-action="restart">Restart</button>
      </div>
      <p class="game-shell__support-text">Score increases with each pipe you clear. Good luck!</p>
    </main>
  `;

  const canvas = container.querySelector<HTMLCanvasElement>("#game-canvas");
  if (!canvas) {
    throw new Error("Failed to initialize the game canvas.");
  }

  const restartButton = container.querySelector<HTMLButtonElement>("[data-action='restart']");
  if (!restartButton) {
    throw new Error("Failed to locate the restart button.");
  }

  const gameState = createGameState(canvas);
  initializeGameLoop(gameState);

  const handleInput = () => {
    handleCanvasClick();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === "Space" || event.key === " ") {
      event.preventDefault();
      handleInput();
    }
  };

  const handlePointerDown = () => {
    canvas.focus();
    handleInput();
  };

  const handleRestart = () => {
    startGame();
    canvas.focus();
  };

  canvas.addEventListener("pointerdown", handlePointerDown);
  restartButton.addEventListener("click", handleRestart);
  window.addEventListener("keydown", handleKeyDown);

  canvas.focus();

  return {
    destroy() {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      restartButton.removeEventListener("click", handleRestart);
      window.removeEventListener("keydown", handleKeyDown);
    },
  };
}

function bootstrap(): void {
  const container = document.querySelector<HTMLDivElement>("#app");
  if (!container) {
    throw new Error("Application container not found.");
  }

  mountGameShell(container);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
} else {
  bootstrap();
}
