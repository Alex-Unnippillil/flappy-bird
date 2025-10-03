import type { Bird } from "./game/entities";
import { Pipe } from "./game/entities";
import {
  CONFIG,
  createGameState,
  resetGameState,
  type GameState,
} from "./game/systems";
import {
  createCanvas2dRenderer,
  type Canvas2dRenderer,
} from "./rendering";

interface ExtendedGameState extends GameState {
  renderer: Canvas2dRenderer;
}

let state!: ExtendedGameState;

function spawnPipe(): void {
  const pipe = new Pipe(
    state.viewportWidth,
    state.viewportHeight - state.groundHeight,
    CONFIG.gapSize
  );
  state.pipes.push(pipe);
}

function updatePipes(bird: Bird): void {
  for (let i = state.pipes.length - 1; i >= 0; i -= 1) {
    const pipe = state.pipes[i];
    pipe.update(
      state.pipeSpeed,
      bird,
      () => {
        state.gameOver = true;
      },
      () => {
        state.score += 1;
        if (state.score > 0 && state.score % 100 === 0) {
          state.pipeSpeed += 0.5;
        }
      }
    );

    if (pipe.isOffScreen()) {
      state.pipes.splice(i, 1);
    }
  }
}

function updateGame(): void {
  const bird = state.bird;
  bird.update(CONFIG.gravity);
  updatePipes(bird);

  if (state.frameCount % CONFIG.pipeInterval === 0) {
    spawnPipe();
  }

  const playableHeight = state.viewportHeight - state.groundHeight;
  if (bird.isOutOfBounds(playableHeight)) {
    state.gameOver = true;
  }
}

function renderGame(): void {
  state.renderer.render({
    bird: state.bird,
    pipes: state.pipes,
    score: state.score,
    gameOver: state.gameOver,
    groundHeight: state.groundHeight,
    viewportWidth: state.viewportWidth,
    viewportHeight: state.viewportHeight,
  });
}

function syncViewport(): void {
  state.renderer.resize();
  const { width, height } = state.renderer.getViewportSize();
  state.viewportWidth = width;
  state.viewportHeight = height;

  if (state.gameOver) {
    renderGame();
  }
}

function runGameLoop(): void {
  state.animationFrameId = null;

  if (!state.gameOver) {
    updateGame();
    state.frameCount += 1;
    state.animationFrameId = requestAnimationFrame(runGameLoop);
  }

  renderGame();
}

function startGame(): void {
  if (state.animationFrameId !== null) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }

  syncViewport();
  resetGameState(state);
  runGameLoop();
}

function handleCanvasClick(): void {
  if (!state.gameOver) {
    state.bird.jump();
  } else {
    startGame();
  }
}

function init(): void {
  const canvas = document.getElementById("gameCanvas");

  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("Expected #gameCanvas to be a <canvas> element");
  }

  if (!canvas.style.width) {
    canvas.style.width = `${canvas.width}px`;
  }
  if (!canvas.style.height) {
    canvas.style.height = `${canvas.height}px`;
  }

  const baseState = createGameState(canvas);
  const renderer = createCanvas2dRenderer(canvas, {
    groundColor: "#ded895",
  });

  state = { ...baseState, renderer };

  canvas.addEventListener("click", handleCanvasClick);
  window.addEventListener("resize", syncViewport);

  startGame();
}

window.addEventListener("DOMContentLoaded", init);
