import { Bird, Pipe } from "./game/entities/index.js";
import { CONFIG, createGameState, resetGameState } from "./game/systems/index.js";
import { createPauseMenu } from "./ui/pause-menu.ts";

let state;
let pauseMenu;
let pauseButton;

function startGame() {
  if (state.animationFrameId !== null) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }

  resetGameState(state);
  state.bird = new Bird(50, state.canvas.height / 2);
  state.pipes.push(new Pipe(state.canvas.width, state.canvas.height, CONFIG.gapSize));
  state.paused = false;
  if (pauseMenu?.isOpen()) {
    pauseMenu.close();
  }
  updatePauseButton();
  runGameLoop();
}

function runGameLoop() {
  if (state.paused) {
    state.animationFrameId = null;
    return;
  }

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
        state.gameOver = true;
      },
      () => {
        state.score += 1;
        if (state.score > 0 && state.score % 100 === 0) {
          state.pipeSpeed += 0.5;
        }
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

  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${state.score}`, 10, 30);

  if (state.bird.isOutOfBounds(canvas.height)) {
    state.gameOver = true;
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
  if (state.paused) {
    return;
  }

  if (!state.gameOver) {
    state.bird.jump();
  } else {
    startGame();
  }
}

function pauseGame() {
  if (state.gameOver || state.paused) {
    return;
  }

  state.paused = true;
  if (state.animationFrameId !== null) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }
  pauseMenu.open();
  updatePauseButton();
}

function resumeGame() {
  if (!state.paused) {
    return;
  }

  state.paused = false;
  pauseMenu.close();
  updatePauseButton();
  runGameLoop();
}

function togglePause() {
  if (state.paused) {
    resumeGame();
  } else {
    pauseGame();
  }
}

function updatePauseButton() {
  if (!pauseButton) {
    return;
  }

  const expanded = state?.paused && !state.gameOver;
  pauseButton.setAttribute("aria-expanded", expanded ? "true" : "false");
  const isPaused = Boolean(state?.paused);
  pauseButton.textContent = isPaused ? "Resume" : "Pause";
  pauseButton.setAttribute(
    "aria-label",
    isPaused ? "Resume the game and close the pause menu" : "Pause the game and open the pause menu"
  );
}

function handleGlobalKeydown(event) {
  if (pauseMenu?.isOpen()) {
    return;
  }

  if (event.key === "Escape" && !state.gameOver && !state.paused) {
    event.preventDefault();
    pauseGame();
    return;
  }

  if (event.code === "KeyP") {
    event.preventDefault();
    if (!state.gameOver) {
      togglePause();
    }
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    handleCanvasClick();
  }
}

function init() {
  const canvas = document.getElementById("gameCanvas");
  state = createGameState(canvas);
  canvas.addEventListener("click", handleCanvasClick);

  pauseButton = document.createElement("button");
  pauseButton.type = "button";
  pauseButton.className = "game-control-button";
  pauseButton.id = "pause-button";
  pauseButton.setAttribute("aria-controls", "pause-menu");
  pauseButton.setAttribute("aria-haspopup", "dialog");
  pauseButton.setAttribute("aria-expanded", "false");
  pauseButton.setAttribute("aria-label", "Pause the game and open the pause menu");
  pauseButton.textContent = "Pause";
  pauseButton.addEventListener("click", () => {
    if (state.gameOver) {
      return;
    }

    togglePause();
  });

  const controlsContainer = document.createElement("div");
  controlsContainer.className = "game-controls";
  controlsContainer.append(pauseButton);
  canvas.insertAdjacentElement("afterend", controlsContainer);

  pauseMenu = createPauseMenu({
    onResume: resumeGame,
    onRestart: startGame,
  });

  document.addEventListener("keydown", handleGlobalKeydown);
  startGame();
}

window.addEventListener("DOMContentLoaded", init);
