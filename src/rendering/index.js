import {
  emitBestRibbonEvent,
  ensureBestRibbon,
} from "../hud/components/BestRibbon.ts";

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

  ensureBestRibbon();

  let currentScore = 0;
  let currentBest = 0;
  let tieAnnouncedAt = 0;
  let bestThreshold = 0;
  let lastBeatScore = 0;

  const announceMilestone = () => {
    if (currentScore <= 0) {
      return;
    }

    if (
      currentBest > 0 &&
      currentScore === currentBest &&
      currentScore > tieAnnouncedAt &&
      currentScore !== lastBeatScore
    ) {
      emitBestRibbonEvent("tie", currentScore);
      tieAnnouncedAt = currentScore;
    }

    if (currentScore > bestThreshold) {
      emitBestRibbonEvent("beat", currentScore);
      bestThreshold = currentScore;
      lastBeatScore = currentScore;
    }
  };

  const resetMilestones = () => {
    tieAnnouncedAt = 0;
    bestThreshold = currentBest;
    lastBeatScore = 0;
  };

  startButton?.addEventListener("click", () => {
    startButton.blur();
  });

  return {
    setScore(value) {
      currentScore = Number(value) || 0;
      safeText(scoreEl, value);
      announceMilestone();
    },
    setBest(value) {
      currentBest = Number(value) || 0;
      bestThreshold = Math.max(bestThreshold, currentBest);
      safeText(bestEl, value);
      announceMilestone();
    },
    setSpeed,
    showIntro() {
      toggle(overlay, true);
      showMessage("Tap, click, or press Space to start");
      toggle(startButton, true);
      resetMilestones();
    },
    showRunning() {
      toggle(overlay, false);
      resetMilestones();
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
  };
}
