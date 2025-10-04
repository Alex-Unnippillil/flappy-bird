import { FinalScore } from "../hud/components/FinalScore.ts";
import { HudRoot } from "../hud/HudRoot.ts";
import { PauseMenu } from "../hud/components/PauseMenu.ts";
import { DimLayer } from "../hud/components/DimLayer.ts";

const noop = () => {};

function resolveElement(element) {
  if (!element) {
    return null;
  }

  if (typeof element === "string") {
    return document.querySelector(element);
  }

  return element;
}

export function createHudController(elements = {}) {
  const scoreEl = resolveElement(elements.score ?? "#scoreValue");
  const bestEl = resolveElement(elements.best ?? "#bestValue");
  const messageEl = resolveElement(elements.message ?? "#gameMessage");
  const overlay = resolveElement(elements.overlay ?? "#gameOverlay");
  const startButton = resolveElement(elements.startButton ?? "#startButton");
  const speedBar = resolveElement(elements.speedBar ?? "#speedFill");
  const speedProgress = resolveElement(elements.speedProgress ?? "#speedProgress");
  const finalScore = overlay ? new FinalScore() : null;

  if (overlay && finalScore) {
    finalScore.attach(overlay, startButton);
    finalScore.hide();
  }
  const dimLayer = overlay ? new DimLayer(overlay) : null;

  const hudRootHost = overlay?.parentElement ?? document.body;
  const hudRoot = new HudRoot({ host: hudRootHost });
  const pauseMenu = new PauseMenu();
  hudRoot.mount(pauseMenu.element, "modal");

  const safeText = (target, value) => {
    if (!target) return;
    target.textContent = String(value);
  };

  const toggle = (target, shouldShow) => {
    if (!target) return;
    target.classList.toggle("is-hidden", !shouldShow);
  };

  const setSpeed = (ratio) => {
    const clamped = Math.max(0, Math.min(1, Number.isFinite(ratio) ? ratio : 0));
    if (speedBar) {
      speedBar.style.width = `${clamped * 100}%`;
    }
    if (speedProgress) {
      speedProgress.setAttribute("aria-valuenow", String(Math.round(clamped * 100)));
    }
  };

  const showMessage = (text) => {
    if (!messageEl) return;
    messageEl.textContent = text;
  };

  startButton?.addEventListener("click", () => {
    startButton.blur();
  });

  return {
    setScore(value) {
      safeText(scoreEl, value);
    },
    setBest(value) {
      safeText(bestEl, value);
    },
    setSpeed,
    showIntro() {
      toggle(overlay, true);
      dimLayer?.setActive(true);
      showMessage("Tap, click, or press Space to start");
      finalScore?.hide();
      if (startButton) {
        startButton.textContent = "Play";
      }
      toggle(startButton, true);
    },
    showRunning() {
      toggle(overlay, false);
      finalScore?.hide();
      dimLayer?.setActive(false);
    },
    showGameOver(score, best, options = {}) {
      toggle(overlay, true);
      showMessage("Game over! Tap or press Space to try again");
      const isRecord =
        typeof options.isNewRecord === "boolean"
          ? options.isNewRecord
          : score > 0 && score === best;
      finalScore?.setScores(score, best, { isRecord });
      finalScore?.show();
      dimLayer?.setActive(true);
      showMessage(`Game over! Score: ${score} · Best: ${best}`);
      toggle(startButton, true);
      if (startButton) {
        startButton.textContent = "Play again";
      }
    },
    onStart(handler = noop) {
      startButton?.addEventListener("click", handler);
    },
    onRestart(handler = noop) {
      startButton?.addEventListener("click", handler);
    },
    pauseMenu,
    hudRoot
    }
    dispose() {
      dimLayer?.dispose();
    },
  };

