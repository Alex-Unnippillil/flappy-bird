import { Bird, Pipe } from "./game/entities/index.js";
import { CONFIG, createGameState, resetGameState } from "./game/systems/index.js";

const HUD_STATUS_DEFAULT = "Tap or click to flap.";
const HUD_STATUS_GAME_OVER = "Game over. Click or tap to play again.";
const BEST_SCORE_STORAGE_KEY = "flappy-bird-best-score";

let state;
let hudElements = null;

function loadBestScore() {
  if (typeof window === "undefined" || !window.localStorage) {
    return 0;
  }

  const storedValue = window.localStorage.getItem(BEST_SCORE_STORAGE_KEY);
  if (storedValue === null) {
    return 0;
  }

  const parsed = Number.parseInt(storedValue, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

function saveBestScore(value) {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  window.localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(value));
}

function updateHud(statusOverride) {
  if (!hudElements || !state) {
    return;
  }

  const finalStatus =
    typeof statusOverride === "string"
      ? statusOverride
      : state.gameOver
        ? HUD_STATUS_GAME_OVER
        : HUD_STATUS_DEFAULT;

  if (hudElements.score) {
    hudElements.score.textContent = state.score.toString();
  }

  if (hudElements.best) {
    hudElements.best.textContent = state.bestScore.toString();
  }

  if (hudElements.status) {
    hudElements.status.textContent = finalStatus;
  }

  if (hudElements.root) {
    hudElements.root.dataset.state = state.gameOver ? "game-over" : "playing";
  }
}

function startGame() {
  if (state.animationFrameId !== null) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }

  resetGameState(state);
  state.bird = new Bird(50, state.canvas.height / 2);
  state.pipes.push(new Pipe(state.canvas.width, state.canvas.height, CONFIG.gapSize));
  updateHud(HUD_STATUS_DEFAULT);
  runGameLoop();
}

function runGameLoop() {
  state.animationFrameId = null;
  const { ctx, canvas } = state;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  state.bird.update(CONFIG.gravity);
  state.bird.draw(ctx);

  for (let i = state.pipes.length - 1; i >= 0; i -= 1) {
    const pipe = state.pipes[i];
    pipe.update(
      state.pipeSpeed,
      state.bird,
      () => {
        if (!state.gameOver) {
          state.gameOver = true;
          updateHud(HUD_STATUS_GAME_OVER);
        }
      },
      () => {
        state.score += 1;
        if (state.score > state.bestScore) {
          state.bestScore = state.score;
          saveBestScore(state.bestScore);
        }
        if (state.score > 0 && state.score % 100 === 0) {
          state.pipeSpeed += 0.5;
        }
        updateHud();
      }
    );

    pipe.draw(ctx);

    if (pipe.isOffScreen()) {
      state.pipes.splice(i, 1);
    }
  }

  if (state.frameCount % CONFIG.pipeInterval === 0) {
    state.pipes.push(new Pipe(canvas.width, canvas.height, CONFIG.gapSize));
  }

  if (state.bird.isOutOfBounds(canvas.height)) {
    if (!state.gameOver) {
      state.gameOver = true;
      updateHud(HUD_STATUS_GAME_OVER);
    }
  }

  if (!state.gameOver) {
    state.frameCount += 1;
    state.animationFrameId = requestAnimationFrame(runGameLoop);
  } else {
    ctx.fillStyle = "#000";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 80, canvas.height / 2);
    ctx.fillText("Click to play again", canvas.width / 2 - 100, canvas.height / 2 + 40);
  }
}

function handleCanvasClick() {
  if (!state.gameOver) {
    state.bird.jump();
  } else {
    startGame();
  }
}

function init() {
  const canvas = document.getElementById("gameCanvas");
  const hudRoot = document.getElementById("hud");
  hudElements = hudRoot
    ? {
        root: hudRoot,
        score: document.getElementById("hudScore"),
        best: document.getElementById("hudBest"),
        status: document.getElementById("hudStatus"),
        powerSummary: document.getElementById("hudPowerSummary"),
      }
    : null;

  if (hudElements?.powerSummary) {
    hudElements.powerSummary.textContent = "No active power-ups.";
  }

  state = createGameState(canvas);
  state.bestScore = loadBestScore();
  updateHud();
  canvas.addEventListener("click", handleCanvasClick);
  startGame();
}

window.addEventListener("DOMContentLoaded", init);
