import { Bird, HUD, Pipe } from "./game/entities";
import { CONFIG, createGameState, resetGameState, type GameState } from "./game/systems";

let state: GameState;

function scheduleNextFrame(): void {
  if (state.animationFrameId === null) {
    state.animationFrameId = requestAnimationFrame(runGameLoop);
  }
}

function startGame(): void {
  if (state.animationFrameId !== null) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }

  resetGameState(state);
  state.bird = new Bird(50, state.canvas.height / 2);
  state.pipes.push(new Pipe(state.canvas.width, state.canvas.height, CONFIG.gapSize));
  state.hud.setScore(0);
  state.hud.setBestScore(state.bestScore);
  state.hud.setPaused(false);
  state.fpsEnabled = state.hud.getFpsEnabled();
  state.lastTimestamp = null;
  scheduleNextFrame();
}

function updateFps(timestamp: number): void {
  if (!state.fpsEnabled) {
    state.lastTimestamp = timestamp;
    state.hud.setFps(null);
    return;
  }

  if (state.paused) {
    state.lastTimestamp = null;
    state.hud.setFps(null);
    return;
  }

  if (state.lastTimestamp === null) {
    state.lastTimestamp = timestamp;
    state.hud.setFps(null);
    return;
  }

  const delta = timestamp - state.lastTimestamp;
  state.lastTimestamp = timestamp;

  if (delta <= 0) {
    return;
  }

  state.fps = 1000 / delta;
  state.hud.setFps(state.fps);
}

function setPaused(paused: boolean): void {
  if (state.gameOver) {
    return;
  }

  if (state.paused === paused) {
    return;
  }

  state.paused = paused;
  state.hud.setPaused(paused);
  state.lastTimestamp = null;

  if (!paused) {
    scheduleNextFrame();
  }
}

function runGameLoop(timestamp: number): void {
  state.animationFrameId = null;

  const { ctx, canvas, bird } = state;
  if (!bird) {
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!state.paused && !state.gameOver) {
    bird.update(CONFIG.gravity);
  }
  bird.draw(ctx);

  for (let i = state.pipes.length - 1; i >= 0; i -= 1) {
    const pipe = state.pipes[i];

    if (!state.paused && !state.gameOver) {
      pipe.update(
        state.pipeSpeed,
        bird,
        () => {
          state.gameOver = true;
        },
        () => {
          state.score += 1;
          state.hud.setScore(state.score);
          state.bestScore = state.hud.getBestScore();
          if (state.score > 0 && state.score % 100 === 0) {
            state.pipeSpeed += 0.5;
          }
        },
      );
    }

    pipe.draw(ctx);

    if (!state.paused && !state.gameOver && pipe.isOffScreen()) {
      state.pipes.splice(i, 1);
    }
  }

  if (!state.paused && !state.gameOver) {
    if (state.frameCount % CONFIG.pipeInterval === 0) {
      state.pipes.push(new Pipe(canvas.width, canvas.height, CONFIG.gapSize));
    }

    state.frameCount += 1;

    if (bird.isOutOfBounds(canvas.height)) {
      state.gameOver = true;
    }
  }

  if (state.gameOver) {
    ctx.fillStyle = "#000";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 80, canvas.height / 2);
    ctx.fillText("Click to play again", canvas.width / 2 - 120, canvas.height / 2 + 40);
    state.hud.setPaused(false);
    state.hud.setFps(null);
    return;
  }

  updateFps(timestamp);

  scheduleNextFrame();
}

function handleCanvasClick(): void {
  if (state.gameOver) {
    startGame();
    return;
  }

  if (state.paused) {
    setPaused(false);
    return;
  }

  state.bird?.jump();
}

function handleKeyDown(event: KeyboardEvent): void {
  if (event.key === " " || event.code === "Space") {
    event.preventDefault();
    if (state.gameOver) {
      startGame();
    } else if (state.paused) {
      setPaused(false);
    } else {
      state.bird?.jump();
    }
    return;
  }

  if (event.key.toLowerCase() === "p") {
    event.preventDefault();
    setPaused(!state.paused);
    return;
  }

  if (event.key.toLowerCase() === "f") {
    event.preventDefault();
    const enabled = !state.fpsEnabled;
    state.fpsEnabled = enabled;
    state.hud.setFpsEnabled(enabled);
    if (!enabled) {
      state.hud.setFps(null);
    }
  }
}

function init(): void {
  const canvas = document.getElementById("gameCanvas");
  const hudRoot = document.getElementById("hud-root");

  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("Unable to initialise game: canvas element not found.");
  }

  if (!hudRoot) {
    throw new Error("Unable to initialise game: HUD root element not found.");
  }

  const hud = new HUD(hudRoot);
  state = createGameState(canvas, hud);

  hud.onFpsToggle((enabled) => {
    state.fpsEnabled = enabled;
    if (!enabled) {
      state.hud.setFps(null);
    }
  });

  canvas.addEventListener("click", handleCanvasClick);
  window.addEventListener("keydown", handleKeyDown);

  startGame();
}

window.addEventListener("DOMContentLoaded", init);
