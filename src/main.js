import { createGameState, handleCanvasClick, initializeGameLoop } from "./game/systems/index.js";

function init() {
  const canvas = document.getElementById("gameCanvas");
  const state = createGameState(canvas);

  initializeGameLoop(state);
  canvas.addEventListener("click", handleCanvasClick);
}

window.addEventListener("DOMContentLoaded", init);
