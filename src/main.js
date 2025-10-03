import { Bird, Pipe } from "./game/entities/index.js";
import { CONFIG, createGameState, resetGameState } from "./game/systems/index.js";
import {
  applyCanvasLayout,
  computeCanvasLayout,
} from "./rendering/layout.ts";

const DESIGN_RESOLUTION = {
  width: 360,
  height: 640,
};

let state;

function updateLayout() {
  if (!state) {
    return;
  }

  const layout = computeCanvasLayout({
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    designResolution: DESIGN_RESOLUTION,
  });

  applyCanvasLayout(state.canvas, layout, DESIGN_RESOLUTION, {
    propertyTarget: document.body,
  });

  state.layout = layout;
}

function startGame() {
  if (state.animationFrameId !== null) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }

  resetGameState(state);
  state.bird = new Bird(50, DESIGN_RESOLUTION.height / 2);
  state.pipes.push(
    new Pipe(DESIGN_RESOLUTION.width, DESIGN_RESOLUTION.height, CONFIG.gapSize)
  );
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
    state.pipes.push(
      new Pipe(canvas.width, canvas.height, CONFIG.gapSize)
    );
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
    ctx.fillText(
      "Click to play again",
      canvas.width / 2 - 100,
      canvas.height / 2 + 40
    );
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

  const layout = computeCanvasLayout({
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    designResolution: DESIGN_RESOLUTION,
  });

  applyCanvasLayout(canvas, layout, DESIGN_RESOLUTION, {
    propertyTarget: document.body,
  });

  state = createGameState(canvas);
  state.layout = layout;

  canvas.addEventListener("click", handleCanvasClick);
  window.addEventListener("resize", updateLayout);

  startGame();
}

window.addEventListener("DOMContentLoaded", init);
