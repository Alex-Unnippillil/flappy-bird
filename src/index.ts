// File Overview: This module belongs to src/index.ts.
import './styles/main.scss';
import gameSpriteIcon from './assets/icon.png';
import '@total-typescript/ts-reset';

import { framer as Framer, rescaleDim } from './utils';
import { CANVAS_DIMENSION } from './constants';
import EventHandler from './events';
import GameObject from './game';
import prepareAssets from './asset-preparation';
import createRAF, { targetFPS } from '@solid-primitives/raf';
import SwOffline from './lib/workbox-work-offline';
import MotionSettings from './lib/settings/motion';
import type {
  MotionPreference,
  MotionPreferenceState
} from './lib/settings/motion';

if (process.env.NODE_ENV === 'production') {
  SwOffline();
}

/**
 * Enabling desynchronized to reduce latency
 * but the frame tearing may experience so
 * we'll need double buffer to atleast reduce
 * the frame tearing
 * */
const virtualCanvas = document.createElement('canvas');
const gameIcon = document.createElement('img');
const canvas = document.querySelector<HTMLCanvasElement>('#main-canvas')!;
const physicalContext = canvas.getContext('2d')!;
const loadingScreen = document.querySelector<HTMLDivElement>('#loading-modal')!;
const motionSelect = document.querySelector<HTMLSelectElement>('#motion-preference');
const motionStatus = document.querySelector<HTMLParagraphElement>(
  '#motion-preference-status'
);
const Game = new GameObject(virtualCanvas);
const fps = new Framer(Game.context);

let isLoaded = false;

gameIcon.src = gameSpriteIcon;

// prettier-ignore
fps.text({ x: 50, y: 50 }, '', ' Cycle');
// prettier-ignore
fps.container({ x: 10, y: 10}, { x: 230, y: 70});

const GameUpdate = (): void => {
  physicalContext.drawImage(virtualCanvas, 0, 0);

  Game.Update();
  Game.Display();

  if (process.env.NODE_ENV === 'development') fps.mark();

  // raf(GameUpdate); Issue #16
};

const ScreenResize = () => {
  const sizeResult = rescaleDim(CANVAS_DIMENSION, {
    height: window.innerHeight * 2 - 50
  });

  canvas.style.maxWidth = String(sizeResult.width / 2) + 'px';
  canvas.style.maxHeight = String(sizeResult.height / 2) + 'px';

  canvas.height = sizeResult.height;
  canvas.width = sizeResult.width;
  virtualCanvas.height = sizeResult.height;
  virtualCanvas.width = sizeResult.width;

  console.log(`Canvas Size: ${sizeResult.width}x${sizeResult.height}`);

  Game.Resize(sizeResult);
};

const removeLoadingScreen = () => {
  EventHandler(Game, canvas);
  loadingScreen.style.display = 'none';
  document.body.style.backgroundColor = 'rgba(28, 28, 30, 1)';
};

const describeMotionPreference = (state: MotionPreferenceState): string => {
  if (state.preference === 'system') {
    return state.systemPrefersReduced
      ? 'Following system preference: reduced motion.'
      : 'Following system preference: full motion.';
  }

  return state.preference === 'reduce'
    ? 'Reduced motion enabled.'
    : 'Full motion enabled.';
};

let lastMotionState: MotionPreferenceState | undefined;

const applyMotionState = (state: MotionPreferenceState): void => {
  if (!document.body) return;

  document.body.dataset.motionPreference = state.preference;
  document.body.dataset.motionReduced = state.reduceMotion ? 'true' : 'false';
};

MotionSettings.subscribe((state) => {
  lastMotionState = state;

  if (motionSelect && motionSelect.value !== state.preference) {
    motionSelect.value = state.preference;
  }

  if (motionStatus) {
    motionStatus.textContent = describeMotionPreference(state);
  }

  applyMotionState(state);
});

if (!document.body) {
  window.addEventListener('DOMContentLoaded', () => {
    if (lastMotionState) {
      applyMotionState(lastMotionState);
    }
  });
}

motionSelect?.addEventListener('change', (event) => {
  const target = event.target as HTMLSelectElement;
  const preference = target.value as MotionPreference;
  MotionSettings.setPreference(preference);
});

//
// Quick Fix. Locking to 60fps
// Quick fix.Long term :)
const [game_running, game_start] = createRAF(targetFPS(GameUpdate, 60));

window.addEventListener('DOMContentLoaded', () => {
  loadingScreen.insertBefore(gameIcon, loadingScreen.childNodes[0]);

  prepareAssets(() => {
    isLoaded = true;

    Game.init();

    ScreenResize();

    // raf(GameUpdate); Issue #16
    if (!game_running()) game_start(); // Quick fix. Long term :)

    if (process.env.NODE_ENV === 'development') removeLoadingScreen();
    else window.setTimeout(removeLoadingScreen, 1000);
  });
});

window.addEventListener('resize', () => {
  if (!isLoaded) return;

  ScreenResize();
});
