// File Overview: This module belongs to src/index.ts.
import './styles/main.scss';
import gameSpriteIcon from './assets/icon.png';
import '@total-typescript/ts-reset';

import { framer as Framer, rescaleDim } from './utils';
import { CANVAS_DIMENSION } from './constants';
import EventHandler, { GameInputTarget } from './events';
import GameObject from './game';
import prepareAssets from './asset-preparation';
import createRAF, { targetFPS } from '@solid-primitives/raf';
import SwOffline from './lib/workbox-work-offline';
import SpriteDestructor, { SpriteAsset } from './lib/sprite-destructor';
import Storage from './lib/storage';
import Sfx from './model/sfx';
import type {
  SpriteBitmapTransfer,
  WorkerToMainMessage,
  WorkerAudioMessage
} from './workers/messages';

if (process.env.NODE_ENV === 'production') {
  SwOffline();
}

const isDevelopment = process.env.NODE_ENV === 'development';

const gameIcon = document.createElement('img');
const canvas = document.querySelector<HTMLCanvasElement>('#main-canvas')!;
const loadingScreen = document.querySelector<HTMLDivElement>('#loading-modal')!;

gameIcon.src = gameSpriteIcon;

new Storage();

const supportsOffscreen = typeof (canvas as HTMLCanvasElement).transferControlToOffscreen === 'function';

const isImageBitmap = (asset: SpriteAsset): asset is ImageBitmap =>
  typeof (asset as ImageBitmap).close === 'function';

const applyCanvasSize = (): IDimension => {
  const sizeResult = rescaleDim(CANVAS_DIMENSION, {
    height: window.innerHeight * 2 - 50
  });

  canvas.style.maxWidth = `${sizeResult.width / 2}px`;
  canvas.style.maxHeight = `${sizeResult.height / 2}px`;
  canvas.width = sizeResult.width;
  canvas.height = sizeResult.height;

  console.log(`Canvas Size: ${sizeResult.width}x${sizeResult.height}`);

  return sizeResult;
};

const removeLoadingScreen = (target: GameInputTarget) => {
  EventHandler(target, canvas);
  loadingScreen.style.display = 'none';
  document.body.style.backgroundColor = 'rgba(28, 28, 30, 1)';
};

const createSpriteBitmapPayload = async (): Promise<SpriteBitmapTransfer[]> => {
  const sprites = Array.from(SpriteDestructor.entries());
  const payload: SpriteBitmapTransfer[] = [];

  for (const [name, asset] of sprites) {
    if (isImageBitmap(asset)) {
      payload.push({ name, bitmap: asset });
      continue;
    }

    const bitmap = await createImageBitmap(asset);
    payload.push({ name, bitmap });
  }

  return payload;
};

type GameRuntime = {
  resize: () => void;
  start: () => Promise<void>;
};

const setupMainThreadGame = (): GameRuntime => {
  const virtualCanvas = document.createElement('canvas');
  const physicalContext = canvas.getContext('2d')!;
  const Game = new GameObject(virtualCanvas);
  const fps = new Framer(Game.context);

  fps.text({ x: 50, y: 50 }, '', ' Cycle');
  fps.container({ x: 10, y: 10 }, { x: 230, y: 70 });

  const render = () => {
    physicalContext.drawImage(virtualCanvas, 0, 0);
    Game.Update();
    Game.Display();

    if (isDevelopment) fps.mark();
  };

  const [running, start] = createRAF(targetFPS(render, 60));

  const resize = () => {
    const size = applyCanvasSize();
    virtualCanvas.width = size.width;
    virtualCanvas.height = size.height;
    Game.Resize(size);
  };

  const startGame = async () => {
    Game.init();
    resize();

    if (!running()) start();

    if (isDevelopment) removeLoadingScreen(Game);
    else window.setTimeout(() => removeLoadingScreen(Game), 1000);
  };

  return {
    resize,
    start: async () => {
      await startGame();
    }
  };
};

const setupWorkerGame = (): GameRuntime => {
  const worker = new Worker(new URL('./workers/game-worker.ts', import.meta.url), {
    type: 'module'
  });
  const offscreenCanvas = canvas.transferControlToOffscreen();

  const [running, start] = createRAF(
    targetFPS((time) => {
      if (!workerReady) return;
      worker.postMessage({ type: 'frame', time });
    }, 60)
  );

  let workerReady = false;
  let pendingSize: IDimension | null = null;

  const forwardInput: GameInputTarget = {
    onClick(position: ICoordinate) {
      worker.postMessage({ type: 'pointer', kind: 'click', position });
    },
    mouseDown(position: ICoordinate) {
      worker.postMessage({ type: 'pointer', kind: 'down', position });
    },
    mouseUp(position: ICoordinate) {
      worker.postMessage({ type: 'pointer', kind: 'up', position });
    },
    startAtKeyBoardEvent() {
      worker.postMessage({ type: 'keyboard', action: 'start' });
    }
  };

  const handleAudio = (message: WorkerAudioMessage) => {
    switch (message.action) {
      case 'init':
        void Sfx.init();
        break;
      case 'volume':
        if (typeof message.volume === 'number') {
          Sfx.volume(message.volume);
        }
        break;
      case 'play':
        switch (message.sound) {
          case 'die':
            Sfx.die();
            break;
          case 'point':
            Sfx.point();
            break;
          case 'swoosh':
            Sfx.swoosh();
            break;
          case 'wing':
            Sfx.wing();
            break;
          case 'hit':
            Sfx.hit(() => {
              if (typeof message.callbackId === 'number') {
                worker.postMessage({ type: 'audio-callback', id: message.callbackId });
              }
            });
            break;
        }
        break;
    }
  };

  worker.addEventListener('message', (event: MessageEvent<WorkerToMainMessage>) => {
    const data = event.data;

    switch (data.type) {
      case 'audio':
        handleAudio(data);
        break;
      case 'storage':
        Storage.save(data.key, data.value);
        break;
      case 'ready':
        workerReady = true;
        if (pendingSize) {
          worker.postMessage({ type: 'resize', size: pendingSize });
          pendingSize = null;
        }

        if (!running()) start();

        if (isDevelopment) removeLoadingScreen(forwardInput);
        else window.setTimeout(() => removeLoadingScreen(forwardInput), 1000);
        break;
    }
  });

  const resize = () => {
    const size = applyCanvasSize();
    pendingSize = size;

    if (workerReady) {
      worker.postMessage({ type: 'resize', size });
      pendingSize = null;
    }
  };

  const startGame = async () => {
    const size = applyCanvasSize();
    pendingSize = size;
    const sprites = await createSpriteBitmapPayload();
    const transferables = sprites.map(({ bitmap }) => bitmap);
    const storagePayload = { highscore: Storage.get('highscore') };

    const transferList: Transferable[] = [offscreenCanvas, ...transferables];

    worker.postMessage(
      {
        type: 'init',
        canvas: offscreenCanvas,
        size,
        isDev: isDevelopment,
        sprites,
        storage: storagePayload
      },
      transferList
    );
  };

  return {
    resize,
    start: async () => {
      await startGame();
    }
  };
};

const runtime: GameRuntime = supportsOffscreen ? setupWorkerGame() : setupMainThreadGame();

let isLoaded = false;

window.addEventListener('DOMContentLoaded', () => {
  loadingScreen.insertBefore(gameIcon, loadingScreen.childNodes[0]);

  prepareAssets(async () => {
    isLoaded = true;
    await runtime.start();
  });
});

window.addEventListener('resize', () => {
  if (!isLoaded) return;

  runtime.resize();
});
