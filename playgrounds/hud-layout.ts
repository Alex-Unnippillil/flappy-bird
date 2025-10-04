import { createHudController } from "../src/rendering/index.js";

type TimerHandle = number | undefined;

const hud = createHudController({
  score: "#scoreValue",
  best: "#bestValue",
  message: "#gameMessage",
  overlay: "#gameOverlay",
  startButton: "#startButton",
  speedBar: "#speedFill",
  speedProgress: "#speedProgress",
});

let bestScore = 24;
let roundTimer: TimerHandle;
let resetTimer: TimerHandle;
let autoStartTimer: TimerHandle;

const clearTimer = (handle: TimerHandle, cancel: (id: number) => void): TimerHandle => {
  if (typeof handle === "number") {
    cancel(handle);
  }
  return undefined;
};

const clearRoundTimer = () => {
  roundTimer = clearTimer(roundTimer, window.clearInterval);
};

const clearResetTimer = () => {
  resetTimer = clearTimer(resetTimer, window.clearTimeout);
};

const clearAutoStartTimer = () => {
  autoStartTimer = clearTimer(autoStartTimer, window.clearTimeout);
};

const scheduleAutoStart = () => {
  clearAutoStartTimer();
  autoStartTimer = window.setTimeout(() => {
    startDemoRound();
  }, 3200);
};

const finishRound = (score: number) => {
  bestScore = Math.max(bestScore, score);
  hud.setBest(bestScore);
  hud.showGameOver(score, bestScore);

  resetTimer = window.setTimeout(() => {
    hud.setScore(0);
    hud.setSpeed(0);
    hud.showIntro();
    scheduleAutoStart();
  }, 2200);
};

function startDemoRound() {
  clearRoundTimer();
  clearResetTimer();
  clearAutoStartTimer();

  hud.showRunning();

  let score = 0;
  let speed = 0;

  roundTimer = window.setInterval(() => {
    score += Math.floor(Math.random() * 3) + 1;
    speed = Math.min(1, speed + 0.08 + Math.random() * 0.05);

    hud.setScore(score);
    hud.setSpeed(speed);

    if (score >= 42) {
      clearRoundTimer();
      finishRound(score);
    }
  }, 850);
}

hud.setScore(0);
hud.setBest(bestScore);
hud.setSpeed(0);
hud.showIntro();
hud.onStart(startDemoRound);

scheduleAutoStart();

window.addEventListener("beforeunload", () => {
  clearRoundTimer();
  clearResetTimer();
  clearAutoStartTimer();
});
