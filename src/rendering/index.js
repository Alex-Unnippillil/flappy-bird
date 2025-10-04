import { MedalBanner } from "../hud/components/MedalBanner.ts";
import { hudAdapter, Medal } from "../hud/adapter.ts";

export { hudAdapter, Medal } from "../hud/adapter.ts";
import { PerfectIndicator } from "../hud/components/PerfectIndicator.ts";
import { createHapticsAdapter } from "../hud/util/haptics.ts";
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

export function createHudController(elements = {}, options = {}) {
  const scoreEl = resolveElement(elements.score ?? "#scoreValue");
  const bestEl = resolveElement(elements.best ?? "#bestValue");
  const messageEl = resolveElement(elements.message ?? "#gameMessage");
  const overlay = resolveElement(elements.overlay ?? "#gameOverlay");
  const startButton = resolveElement(elements.startButton ?? "#startButton");
  const speedBar = resolveElement(elements.speedBar ?? "#speedFill");
  const speedProgress = resolveElement(elements.speedProgress ?? "#speedProgress");
  const overlayParent =
    overlay?.parentElement instanceof HTMLElement ? overlay.parentElement : null;
  const medalMount =
    resolveElement(elements.medalBanner ?? null) ?? overlayParent ?? undefined;

  new MedalBanner({
    mount: medalMount,
  });
  const perfectIndicatorEl = resolveElement(
    elements.perfectIndicator ?? "#perfectIndicator"
  );

  const toNumeric = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const medalEl = resolveElement(elements.medal);

  const haptics = options.haptics ?? createHapticsAdapter();
  const supportsHaptics = Boolean(haptics?.supported);
  let lastScore = 0;
  let lastMedal = null;
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

  let lastScore = toNumeric(scoreEl?.textContent ?? 0);

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
      const numericValue = toNumeric(value, 0);
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
        lastScore = numericValue;
      currentScore = Number(value) || 0;
      safeText(scoreEl, value);
      const numericValue = Number(value);
      if (
        supportsHaptics &&
        Number.isFinite(numericValue) &&
        numericValue > lastScore &&
        typeof haptics.scoreMilestone === "function"
      ) {
        haptics.scoreMilestone(numericValue);
      }
      if (Number.isFinite(numericValue)) {
        lastScore = numericValue;
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
    destroy() {
      perfectIndicator?.destroy();
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
    events: {
      on: addEventListener,
      off: removeEventListener,
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

