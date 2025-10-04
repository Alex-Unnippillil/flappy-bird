import { PerfectIndicator } from "../hud/components/PerfectIndicator.ts";

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
  const perfectIndicatorEl = resolveElement(
    elements.perfectIndicator ?? "#perfectIndicator"
  );

  const toNumeric = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

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

  startButton?.addEventListener("click", () => {
    startButton.blur();
  });

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
    destroy() {
      perfectIndicator?.destroy();
    },
    onStart(handler = noop) {
      startButton?.addEventListener("click", handler);
    },
    onRestart(handler = noop) {
      startButton?.addEventListener("click", handler);
    },
    events: {
      on: addEventListener,
      off: removeEventListener,
    },
  };
}
