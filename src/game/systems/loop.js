import { Bird, Pipe } from "../entities/index.js";
import { CONFIG, resetGameState, persistBestScore } from "./state.js";
import { createThreeRenderer } from "../../rendering/three/renderer.js";
import { createHudController } from "../../rendering/index.js";
import { HUD_GAME_OVER } from "../../hud/components/SessionStats.ts";

let state = null;
let renderer = null;
let hud = null;

function ensureState() {
  if (!state) {
    throw new Error("Game state has not been initialized.");
  }
}

function ensureRenderer() {
  if (!renderer) {
    throw new Error("Renderer has not been initialized.");
  }
}

function spawnPipe(xPosition) {
  ensureState();
  const pipe = new Pipe(
    xPosition,
    state.playfieldHeight,
    CONFIG.gapSize,
    state.prng
  );
  state.pipes.push(pipe);
  return pipe;
}

function refreshHud() {
  ensureState();
  if (!hud) return;

  hud.setScore(state.score);
  hud.setBest(state.bestScore);
  const speedRange = CONFIG.maxPipeSpeed - CONFIG.initialPipeSpeed;
  const speedProgress = Math.min(
    1,
    (state.pipeSpeed - CONFIG.initialPipeSpeed) / (speedRange || 1)
  );
  hud.setSpeed(speedProgress);
}

function syncHighScore() {
  ensureState();
  let didImprove = false;
  if (state.score > state.bestScore) {
    state.bestScore = state.score;
    persistBestScore(state.bestScore);
    didImprove = true;
  }
  return didImprove;
}

function showIntro() {
  if (hud) {
    hud.showIntro();
  }
}

function updatePipes(delta, onCollision) {
  ensureState();

  for (let i = state.pipes.length - 1; i >= 0; i -= 1) {
    const pipe = state.pipes[i];
    pipe.update(
      state.pipeSpeed,
      delta,
      state.bird,
      onCollision,
      () => {
        state.score += 1;
        if (
          state.score > 0 &&
          state.score % CONFIG.speedRampInterval === 0
        ) {
          state.pipeSpeed = Math.min(
            CONFIG.maxPipeSpeed,
            state.pipeSpeed + CONFIG.speedRampAmount
          );
        }
        if (state.score > state.bestScore) {
          state.bestScore = state.score;
          persistBestScore(state.bestScore);
        }
        refreshHud();
      }
    );

    if (pipe.isOffScreen()) {
      state.pipes.splice(i, 1);
    }
  }
}

function prepareRound() {
  ensureState();
  ensureRenderer();

  resetGameState(state);
  state.sessionStats.attempts += 1;
  state.sessionStats.lastScore = 0;
  state.sessionStats.lastDurationMs = 0;
  state.bird = new Bird(80, state.playfieldHeight / 2, {
    width: 38,
    height: 26,
    flapStrength: 9.5,
  });
  state.awaitingStart = false;
  state.isRunning = true;
  state.gameOver = false;

  // Spawn a pair of starter pipes so the playfield looks alive immediately.
  state.pipes.length = 0;
  spawnPipe(state.playfieldWidth + 120);
  spawnPipe(state.playfieldWidth + 120 + 260);

  refreshHud();
  if (hud) {
    hud.showRunning();
  }
}

function endRound() {
  ensureState();
  state.isRunning = false;
  state.gameOver = true;
  state.awaitingStart = true;
  const isNewRecord = syncHighScore();
  refreshHud();
  state.sessionStats.lastScore = state.score;
  state.sessionStats.lastDurationMs = state.roundDurationMs;
  state.sessionStats.totalScore += state.score;
  state.sessionStats.totalDurationMs += state.roundDurationMs;
  state.sessionStats.bestScore = Math.max(
    state.sessionStats.bestScore,
    state.score
  );
  if (hud) {
    hud.showGameOver(state.score, state.bestScore, { isNewRecord });
  }
  if (typeof window !== "undefined") {
    const attempts = state.sessionStats.attempts;
    window.dispatchEvent(
      new CustomEvent(HUD_GAME_OVER, {
        detail: {
          attempts,
          averageScore:
            attempts > 0 ? state.sessionStats.totalScore / attempts : 0,
          averageDurationMs:
            attempts > 0 ? state.sessionStats.totalDurationMs / attempts : 0,
          lastScore: state.sessionStats.lastScore,
          lastDurationMs: state.sessionStats.lastDurationMs,
          sessionBest: state.sessionStats.bestScore,
          bestScore: state.bestScore,
        },
      })
    );
  }
  if (renderer) {
    renderer.markGameOver();
  }
}

function update(timestamp) {
  ensureState();
  ensureRenderer();

  const now = timestamp ?? performance.now();
  if (state.lastTimestamp === null) {
    state.lastTimestamp = now;
  }

  const deltaMs = Math.min(now - state.lastTimestamp, 1000 / 15);
  state.lastTimestamp = now;
  const delta = deltaMs / (1000 / 60);
  state.roundDurationMs += deltaMs;

  state.spawnTimer += deltaMs;
  if (state.spawnTimer >= CONFIG.pipeIntervalMs) {
    const overshoot = state.spawnTimer - CONFIG.pipeIntervalMs;
    state.spawnTimer = overshoot;
    spawnPipe(state.playfieldWidth + 100);
  }

  state.bird.update(CONFIG.gravity, delta);
  updatePipes(delta, () => endRound());

  if (state.bird.isOutOfBounds(state.playfieldHeight)) {
    endRound();
  }

  renderer.render(state, deltaMs);

  if (!state.gameOver) {
    state.animationFrameId = requestAnimationFrame(update);
  }
}

export function initializeGameLoop(gameState, options = {}) {
  state = gameState;

  renderer = createThreeRenderer(state.canvas, options.rendererOptions);
  hud = createHudController(options.hudElements ?? {}, {
    hudRoot: options.hudRoot,
  });
  refreshHud();
  renderer.render(state, 0);
  showIntro();
}

export function startGame() {
  ensureState();
  ensureRenderer();

  if (state.animationFrameId !== null) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }

  prepareRound();

  state.lastTimestamp = null;
  state.animationFrameId = requestAnimationFrame(update);
}

export function handleCanvasClick() {
  ensureState();

  if (state.awaitingStart || state.gameOver) {
    const wasStartingRound = state.awaitingStart || state.gameOver;
    startGame();
    if (state.isRunning && state.bird) {
      state.bird.jump();
      renderer?.pulseBird?.();
    }
    return;
  }

  if (!state.isRunning) {
    return;
  }

  state.bird.jump();
  renderer?.pulseBird?.();
}

export function teardownGameLoop() {
  if (state?.animationFrameId) {
    cancelAnimationFrame(state.animationFrameId);
  }
  renderer?.dispose();
  hud?.destroy?.();
  renderer = null;
  hud = null;
  state = null;
}
