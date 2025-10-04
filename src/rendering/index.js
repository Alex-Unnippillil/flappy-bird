import { getMedalForScore, Medal } from "../hud/logic/medals";

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

  let currentMedal = Medal.None;
  const medalListeners = new Set();

  const notifyMedalChange = (medal) => {
    medalListeners.forEach((listener) => {
      try {
        listener(medal);
      } catch (error) {
        console.error("HUD medal listener error", error);
      }
    });
  };

  return {
    setScore(value) {
      safeText(scoreEl, value);
      const medal = getMedalForScore(Number(value));
      if (medal !== currentMedal) {
        currentMedal = medal;
        notifyMedalChange(currentMedal);
      }
    },
    setBest(value) {
      safeText(bestEl, value);
    },
    setSpeed,
    showIntro() {
      toggle(overlay, true);
      showMessage("Tap, click, or press Space to start");
      toggle(startButton, true);
    },
    showRunning() {
      toggle(overlay, false);
    },
    showGameOver(score, best) {
      toggle(overlay, true);
      showMessage(`Game over! Score: ${score} · Best: ${best}`);
      toggle(startButton, true);
    },
    onStart(handler = noop) {
      startButton?.addEventListener("click", handler);
    },
    onRestart(handler = noop) {
      startButton?.addEventListener("click", handler);
    },
    onMedalChange(handler = noop) {
      if (typeof handler !== "function") {
        return noop;
      }
      medalListeners.add(handler);
      return () => {
        medalListeners.delete(handler);
      };
    },
    getCurrentMedal() {
      return currentMedal;
    },
  };
}
