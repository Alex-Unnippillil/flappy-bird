import { createGameOverTitle } from "../hud/components/GameOverTitle.ts";
import { MedalBanner } from "../hud/components/MedalBanner.ts";
import { hudAdapter, Medal } from "../hud/adapter.ts";
export { hudAdapter, Medal } from "../hud/adapter.ts";
import { PerfectIndicator } from "../hud/components/PerfectIndicator.ts";
import { createHapticsAdapter } from "../hud/util/haptics.ts";
import {
  emitBestRibbonEvent,
  ensureBestRibbon,
} from "../hud/components/BestRibbon.ts";
import { getMedalForScore } from "../hud/logic/medals.ts";
import { FinalScore } from "../hud/components/FinalScore.ts";
import { HudRoot } from "../hud/HudRoot.ts";
import { PauseMenu } from "../hud/components/PauseMenu.ts";
import { DimLayer } from "../hud/components/DimLayer.ts";

const DEFAULT_SELECTORS = {
  score: "#scoreValue",
  best: "#bestValue",
  message: "#gameMessage",
  overlay: "#gameOverlay",
  startButton: "#startButton",
  speedBar: "#speedFill",
  speedProgress: "#speedProgress",
  perfectIndicator: "#perfectIndicator",
};

const noop = () => {};

function resolveElement(input, fallbackSelector) {
  const candidate = input ?? fallbackSelector;
  if (!candidate) {
    return null;
  }

  if (typeof candidate === "string") {
    return document.querySelector(candidate);
  }

  return candidate ?? null;
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function safeText(target, value) {
  if (!target) return;
  target.textContent = String(value);
}

function toggleElement(target, shouldShow) {
  if (!target) return;
  target.classList.toggle("is-hidden", !shouldShow);
  if ("hidden" in target) {
    target.hidden = !shouldShow;
  }
}

function clamp01(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

export function createHudController(elements = {}, options = {}) {
  const scoreEl = resolveElement(elements.score, DEFAULT_SELECTORS.score);
  const bestEl = resolveElement(elements.best, DEFAULT_SELECTORS.best);
  const messageEl = resolveElement(elements.message, DEFAULT_SELECTORS.message);
  const overlay = resolveElement(elements.overlay, DEFAULT_SELECTORS.overlay);
  const startButton = resolveElement(elements.startButton, DEFAULT_SELECTORS.startButton);
  const speedBar = resolveElement(elements.speedBar, DEFAULT_SELECTORS.speedBar);
  const speedProgress = resolveElement(
    elements.speedProgress,
    DEFAULT_SELECTORS.speedProgress,
  );
  const perfectIndicatorRoot = resolveElement(
    elements.perfectIndicator,
    DEFAULT_SELECTORS.perfectIndicator,
  );
  const medalEl = resolveElement(elements.medal, null);
  const medalBannerMount = resolveElement(elements.medalBanner, null);

  if (startButton instanceof HTMLButtonElement && !startButton.hasAttribute("type")) {
    startButton.type = "button";
  }

  const overlayParent = overlay?.parentElement ?? null;
  const medalBanner = new MedalBanner({
    mount: medalBannerMount ?? overlayParent ?? undefined,
  });

  const haptics = options.haptics ?? createHapticsAdapter();
  const supportsHaptics = Boolean(haptics?.supported);

  const eventTarget = typeof EventTarget !== "undefined" ? new EventTarget() : null;

  const addEventListener = (type, handler) => {
    if (!eventTarget) return noop;
    eventTarget.addEventListener(type, handler);
    return () => eventTarget.removeEventListener(type, handler);
  };

  const removeEventListener = (type, handler) => {
    eventTarget?.removeEventListener(type, handler);
  };

  const emitEvent = (type, detail) => {
    if (!eventTarget) return;
    eventTarget.dispatchEvent(new CustomEvent(type, { detail }));
  };

  const perfectIndicator =
    perfectIndicatorRoot && eventTarget
      ? new PerfectIndicator({
          root: perfectIndicatorRoot,
          adapter: {
            on: (type, handler) => addEventListener(type, handler),
            off: (type, handler) => removeEventListener(type, handler),
          },
        })
      : null;

  const finalScore = overlay ? new FinalScore() : null;
  if (overlay && finalScore) {
    finalScore.attach(overlay, startButton ?? null);
    finalScore.hide();
  }

  const dimLayer = overlay ? new DimLayer(overlay) : null;

  const hudRootHost = options.hudRoot ?? overlayParent ?? document.body;
  const hudRoot = new HudRoot({ host: hudRootHost });
  const pauseMenu = new PauseMenu();
  hudRoot.mount(pauseMenu.element, "modal");

  const gameOverTitle = overlay ? createGameOverTitle() : null;
  if (gameOverTitle && overlay) {
    if (messageEl) {
      overlay.insertBefore(gameOverTitle.element, messageEl);
    } else {
      overlay.appendChild(gameOverTitle.element);
    }
  }

  ensureBestRibbon();

  let lastScore = toNumber(scoreEl?.textContent ?? 0);
  let currentScore = lastScore;
  let currentBest = toNumber(bestEl?.textContent ?? 0);
  let tieAnnouncedAt = 0;
  let bestThreshold = currentBest;
  let lastBeatScore = 0;
  let currentMedal = Medal.None;
  let lastMedalLabel = medalEl?.textContent ?? null;

  const medalListeners = new Set();
  const cleanupTasks = new Set();

  const registerCleanup = (task) => {
    cleanupTasks.add(task);
    return () => {
      cleanupTasks.delete(task);
      task();
    };
  };

  if (startButton) {
    const blurOnActivate = () => {
      if (typeof startButton.blur === "function") {
        startButton.blur();
      }
    };
    startButton.addEventListener("click", blurOnActivate);
    registerCleanup(() => {
      startButton.removeEventListener("click", blurOnActivate);
    });
  }

  const showMessage = (text) => {
    if (!messageEl) return;
    messageEl.textContent = text;
  };

  const updateMedalDisplay = (medal) => {
    if (!medalEl) return;
    medalEl.textContent = medal ?? "";
    if (medal) {
      medalEl.dataset.medal = medal;
    } else {
      delete medalEl.dataset.medal;
    }
  };

  const notifyMedalChange = (medal) => {
    medalListeners.forEach((listener) => {
      try {
        listener(medal);
      } catch (error) {
        console.error("HUD medal listener error", error);
      }
    });
  };

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

  const handleScoreHaptics = (value, delta) => {
    if (!supportsHaptics || typeof haptics.scoreMilestone !== "function") {
      return;
    }
    if (delta > 0) {
      haptics.scoreMilestone(value);
    }
  };

  const handleMedalHaptics = (medal) => {
    if (!supportsHaptics || typeof haptics.medalEarned !== "function") {
      return;
    }
    if (medal && medal !== Medal.None) {
      haptics.medalEarned(medal);
    }
  };

  const updateMedal = (medal) => {
    if (medal === currentMedal) {
      return;
    }
    currentMedal = medal;
    updateMedalDisplay(medal === Medal.None ? "" : medal);
    handleMedalHaptics(medal);
    notifyMedalChange(medal);
  };

  const controller = {
    setScore(value) {
      const numericValue = toNumber(value, 0);
      const detail = {
        value: numericValue,
        previous: lastScore,
        delta: numericValue - lastScore,
      };

      safeText(scoreEl, numericValue);

      if (detail.delta !== 0) {
        emitEvent("score:change", detail);
        if (detail.delta > 0) {
          emitEvent("score:increment", detail);
        } else {
          emitEvent("score:decrement", detail);
        }
      }

      handleScoreHaptics(numericValue, detail.delta);

      lastScore = numericValue;
      currentScore = numericValue;
      announceMilestone();

      const medal = getMedalForScore(numericValue);
      updateMedal(medal);
    },
    setBest(value) {
      const numericValue = toNumber(value, 0);
      safeText(bestEl, numericValue);
      currentBest = numericValue;
      bestThreshold = Math.max(bestThreshold, currentBest);
      announceMilestone();
    },
    setSpeed(ratio) {
      const clamped = clamp01(ratio);
      if (speedBar) {
        speedBar.style.width = `${clamped * 100}%`;
      }
      if (speedProgress) {
        speedProgress.setAttribute("aria-valuenow", String(Math.round(clamped * 100)));
      }
    },
    showIntro() {
      toggleElement(overlay, true);
      dimLayer?.setActive(true);
      gameOverTitle?.hide();
      finalScore?.hide();
      showMessage("Tap, click, or press Space to start");
      if (startButton) {
        startButton.textContent = "Play";
        toggleElement(startButton, true);
      }
      resetMilestones();
    },
    showRunning() {
      toggleElement(overlay, false);
      dimLayer?.setActive(false);
      gameOverTitle?.hide();
      finalScore?.hide();
      resetMilestones();
    },
    showGameOver(score, best, options = {}) {
      toggleElement(overlay, true);
      dimLayer?.setActive(true);
      gameOverTitle?.show();
      showMessage("Game over! Tap or press Space to try again");
      if (startButton) {
        startButton.textContent = "Play again";
        toggleElement(startButton, true);
      }
      finalScore?.setScores(toNumber(score, 0), toNumber(best, 0), options);
      finalScore?.show();
    },
    destroy() {
      cleanupTasks.forEach((task) => {
        task();
      });
      cleanupTasks.clear();
      perfectIndicator?.destroy();
      medalBanner?.destroy?.();
      pauseMenu.destroy();
      hudRoot.destroy();
      dimLayer?.dispose();
      if (gameOverTitle && overlay?.contains(gameOverTitle.element)) {
        overlay.removeChild(gameOverTitle.element);
      }
    },
    onStart(handler = noop) {
      if (!startButton || typeof handler !== "function") {
        return noop;
      }
      startButton.addEventListener("click", handler);
      return registerCleanup(() => {
        startButton.removeEventListener("click", handler);
      });
    },
    onRestart(handler = noop) {
      if (!startButton || typeof handler !== "function") {
        return noop;
      }
      startButton.addEventListener("click", handler);
      return registerCleanup(() => {
        startButton.removeEventListener("click", handler);
      });
    },
    awardMedal(event) {
      if (!event || !event.medal) {
        hudAdapter.emitMedal({ medal: Medal.None });
        updateMedal(Medal.None);
        return;
      }
      hudAdapter.emitMedal(event);
      updateMedal(event.medal);
    },
    clearMedal() {
      hudAdapter.emitMedal({ medal: Medal.None });
      updateMedal(Medal.None);
    },
    events: {
      on: addEventListener,
      off: removeEventListener,
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
    pauseMenu,
    hudRoot,
  };

  if (lastMedalLabel && !currentMedal) {
    updateMedalDisplay(lastMedalLabel);
  }

  return controller;
}
