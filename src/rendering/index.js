import {
  emitBestRibbonEvent,
  ensureBestRibbon,
} from "../hud/components/BestRibbon.ts";
import { getMedalForScore, Medal } from "../hud/logic/medals";
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
      currentScore = Number(value) || 0;
      safeText(scoreEl, value);
      announceMilestone();
      const medal = getMedalForScore(Number(value));
      if (medal !== currentMedal) {
        currentMedal = medal;
        notifyMedalChange(currentMedal);
      }
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
      dimLayer?.setActive(true);
      showMessage("Tap, click, or press Space to start");
      finalScore?.hide();
      if (startButton) {
        startButton.textContent = "Play";
      }
      toggle(startButton, true);
      resetMilestones();
    },
    showRunning() {
      toggle(overlay, false);
      resetMilestones();
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
    pauseMenu,
    hudRoot
    }
    dispose() {
      dimLayer?.dispose();
    },
  };

