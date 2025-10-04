import { createGameOverTitle } from "../hud/components/GameOverTitle.ts";
import { MedalBanner } from "../hud/components/MedalBanner.ts";
import { hudAdapter, Medal } from "../hud/adapter.ts";
import { PerfectIndicator } from "../hud/components/PerfectIndicator.ts";
import { createHapticsAdapter } from "../hud/util/haptics.ts";
import {
  emitBestRibbonEvent,
  ensureBestRibbon,
} from "../hud/components/BestRibbon.ts";
import { getMedalForScore } from "../hud/logic/medals";
import { FinalScore } from "../hud/components/FinalScore.ts";
import { HudRoot } from "../hud/HudRoot.ts";
import { PauseMenu } from "../hud/components/PauseMenu.ts";
import { DimLayer } from "../hud/components/DimLayer.ts";

export { hudAdapter, Medal } from "../hud/adapter.ts";

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

function safeText(target, value) {
  if (!target) return;
  target.textContent = String(value);
}

function toggle(target, shouldShow) {
  if (!target) return;
  target.classList.toggle("is-hidden", !shouldShow);
}

function toNumeric(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function createHudController(elements = {}, options = {}) {
  const scoreEl = resolveElement(elements.score ?? "#scoreValue");
  const bestEl = resolveElement(elements.best ?? "#bestValue");
  const messageEl = resolveElement(elements.message ?? "#gameMessage");
  const overlay = resolveElement(elements.overlay ?? "#gameOverlay");
  const startButton = resolveElement(elements.startButton ?? "#startButton");
  const speedBar = resolveElement(elements.speedBar ?? "#speedFill");
  const speedProgress = resolveElement(elements.speedProgress ?? "#speedProgress");
  const medalEl = resolveElement(elements.medal ?? null);
  const perfectIndicatorEl = resolveElement(
    elements.perfectIndicator ?? "#perfectIndicator"
  );

  const overlayParent =
    overlay?.parentElement instanceof HTMLElement ? overlay.parentElement : null;
  const medalMount =
    resolveElement(elements.medalBanner ?? null) ?? overlayParent ?? undefined;

  new MedalBanner({
    mount: medalMount,
  });

  const haptics = options.haptics ?? createHapticsAdapter();
  const supportsHaptics = Boolean(haptics?.supported);

  let lastScore = toNumeric(scoreEl?.textContent ?? 0);
  let currentScore = lastScore;
  let currentBest = toNumeric(bestEl?.textContent ?? 0);
  let lastMedal = null;
  let currentMedal = Medal.None;

  const finalScore = overlay ? new FinalScore() : null;
  if (overlay && finalScore) {
    finalScore.attach(overlay, startButton ?? undefined);
    finalScore.hide();
  }

  const dimLayer = overlay ? new DimLayer(overlay) : null;

  const hudRootHost = overlay?.parentElement ?? document.body;
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

  const setSpeed = (ratio) => {
    const clamped = Math.max(0, Math.min(1, Number.isFinite(ratio) ? ratio : 0));
    if (speedBar) {
      speedBar.style.width = `${clamped * 100}%`;
    }
    if (speedProgress) {
      speedProgress.setAttribute("aria-valuenow", String(Math.round(clamped * 100)));
    }
  };

  const eventTarget = typeof EventTarget !== "undefined" ? new EventTarget() : null;

  const emitEvent = (type, detail) => {
    if (!eventTarget) return;
    eventTarget.dispatchEvent(new CustomEvent(type, { detail }));
  };

  const addEventListener = (type, handler) => {
    if (!eventTarget) {
      return noop;
    }
    eventTarget.addEventListener(type, handler);
    return () => eventTarget.removeEventListener(type, handler);
  };

  const removeEventListener = (type, handler) => {
    eventTarget?.removeEventListener(type, handler);
  };

  const perfectIndicator =
    perfectIndicatorEl && eventTarget
      ? new PerfectIndicator({
          root: perfectIndicatorEl,
          adapter: {
            on: (type, handler) => addEventListener(type, handler),
            off: (type, handler) => removeEventListener(type, handler),
          },
        })
      : null;

  ensureBestRibbon();

  let tieAnnouncedAt = 0;
  let bestThreshold = currentBest;
  let lastBeatScore = 0;

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

  const showMessage = (text) => {
    if (!messageEl) return;
    messageEl.textContent = text;
  };

  return {
    setScore(value) {
      const numericValue = toNumeric(value, 0);
      currentScore = numericValue;
      safeText(scoreEl, numericValue);

      if (numericValue !== lastScore) {
        const detail = {
          value: numericValue,
          previous: lastScore,
          delta: numericValue - lastScore,
        };
        emitEvent("score:change", detail);
        if (detail.delta > 0) {
          emitEvent("score:increment", detail);
        } else if (detail.delta < 0) {
          emitEvent("score:decrement", detail);
        }

        if (
          supportsHaptics &&
          detail.delta > 0 &&
          typeof haptics.scoreMilestone === "function"
        ) {
          haptics.scoreMilestone(numericValue);
        }

        lastScore = numericValue;
        announceMilestone();

        const medal = getMedalForScore(numericValue);
        if (medal !== currentMedal) {
          currentMedal = medal;
          notifyMedalChange(currentMedal);
        }
      }
    },
    setBest(value) {
      const numericValue = toNumeric(value, 0);
      currentBest = numericValue;
      bestThreshold = Math.max(bestThreshold, currentBest);
      safeText(bestEl, numericValue);
      announceMilestone();
    },
    setMedal(tier) {
      if (medalEl) {
        safeText(medalEl, tier ?? "");
      }
      if (
        supportsHaptics &&
        tier &&
        tier !== lastMedal &&
        typeof haptics.medalEarned === "function"
      ) {
        haptics.medalEarned(tier);
      }
      lastMedal = tier ?? null;
    },
    setSpeed,
    showIntro() {
      toggle(overlay, true);
      gameOverTitle?.hide();
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
      gameOverTitle?.hide();
      resetMilestones();
      finalScore?.hide();
      dimLayer?.setActive(false);
    },
    showGameOver(score, best, options = {}) {
      toggle(overlay, true);
      gameOverTitle?.show();
      const isRecord =
        typeof options.isNewRecord === "boolean"
          ? options.isNewRecord
          : score > 0 && score === best;
      showMessage("Game over! Tap or press Space to try again");
      finalScore?.setScores(score, best, { isRecord });
      finalScore?.show();
      dimLayer?.setActive(true);
      toggle(startButton, true);
      if (startButton) {
        startButton.textContent = "Play again";
      }
    },
    destroy() {
      perfectIndicator?.destroy();
      dimLayer?.dispose();
      pauseMenu.destroy();
      hudRoot.destroy();
      gameOverTitle?.destroy?.();
    },
    onStart(handler = noop) {
      startButton?.addEventListener("click", handler);
    },
    onRestart(handler = noop) {
      startButton?.addEventListener("click", handler);
    },
    awardMedal(event) {
      hudAdapter.emitMedal(event);
    },
    clearMedal() {
      hudAdapter.emitMedal({ medal: Medal.None });
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
    get pauseMenu() {
      return pauseMenu;
    },
    get hudRoot() {
      return hudRoot;
    },
  };
}
