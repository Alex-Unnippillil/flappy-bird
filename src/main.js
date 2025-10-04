import "./features/F10_score_hud/register.ts";
import "./features/autoload.ts";
import {
  CONFIG,
  createGameState,
  initializeGameLoop,
  startGame,
  handleCanvasClick,
} from "./game/systems/index.js";
import { initSessionStats } from "./hud/components/SessionStats.ts";
import { createSceneContext } from "./core/scene.ts";

function bindInput(canvas) {
  const pressAction = (event) => {
    event.preventDefault();
    handleCanvasClick();
  };

  canvas.addEventListener("pointerdown", pressAction);
  canvas.addEventListener(
    "keydown",
    (event) => {
      if (event.repeat) return;
      const actionableKeys = new Set(["Space", "ArrowUp", "KeyW", "KeyX"]);
      if (actionableKeys.has(event.code)) {
        pressAction(event);
      } else if (event.code === "KeyR") {
        event.preventDefault();
        startGame();
      }
    },
    { passive: false }
  );

  window.addEventListener(
    "keydown",
    (event) => {
      if (event.repeat) return;
      const actionableKeys = new Set(["Space", "ArrowUp", "KeyW"]);
      if (actionableKeys.has(event.code)) {
        event.preventDefault();
        handleCanvasClick();
      } else if (event.code === "KeyR") {
        event.preventDefault();
        startGame();
      }
    },
    { passive: false }
  );

  canvas.addEventListener("touchstart", pressAction, { passive: false });

  const startButton = document.getElementById("startButton");
  startButton?.addEventListener("click", () => {
    handleCanvasClick();
  });
}

function resizeCanvas(canvas) {
  const container = canvas.parentElement;
  if (!container) return;

  const aspect = CONFIG.playfieldHeight / CONFIG.playfieldWidth;
  const maxWidth = Math.min(window.innerWidth * 0.9, 540);
  const width = Math.max(280, maxWidth);
  const height = width * aspect;

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
}

function init() {
  try {
    createSceneContext();
  } catch (error) {
    console.warn("Unable to initialize Three.js scene", error);
  }

  const canvas = document.getElementById("gameCanvas");
  if (!canvas) {
    throw new Error("Game canvas not found");
  }

  canvas.setAttribute("role", "application");
  canvas.setAttribute("aria-label", "Flappy Bird 3D playfield");
  canvas.setAttribute("tabindex", "0");

  const state = createGameState(canvas);
  initializeGameLoop(state, {
    hudElements: {
      score: "#scoreValue",
      best: "#bestValue",
      message: "#gameMessage",
      startButton: "#startButton",
      overlay: "#gameOverlay",
      speedBar: "#speedFill",
      speedProgress: "#speedProgress",
      perfectIndicator: "#perfectIndicator",
    },
  });

  initSessionStats();

  bindInput(canvas);
  resizeCanvas(canvas);
  window.addEventListener("resize", () => resizeCanvas(canvas));
}

window.addEventListener("DOMContentLoaded", init);
