// File Overview: This module belongs to src/workers/game-worker.ts.
import GameObject from '../game';
import { framer as Framer } from '../utils';
import SpriteDestructor from '../lib/sprite-destructor';
import Storage from '../lib/storage';
import Sfx from '../model/sfx';
import type { SpriteAsset } from '../lib/sprite-destructor';
import type { IStoreValue } from '../lib/storage';
import type {
  MainToWorkerMessage,
  WorkerToMainMessage,
  WorkerInitMessage,
  SpriteBitmapTransfer
} from './messages';
import { WorkerAudioMessage, WorkerStorageMessage, WorkerReadyMessage } from './messages';

const postWorkerMessage = (message: WorkerToMainMessage) => {
  self.postMessage(message);
};

const audioCallbacks = new Map<number, IEmptyFunction>();
let audioCallbackId = 0;

const bridgeAudio = () => {
  Sfx.init = async () => {
    postWorkerMessage({ type: 'audio', action: 'init' });
  };

  Sfx.volume = (num: number): void => {
    Sfx.currentVolume = num;
    postWorkerMessage({ type: 'audio', action: 'volume', volume: num });
  };

  const play = (sound: NonNullable<WorkerAudioMessage['sound']>) => () => {
    postWorkerMessage({ type: 'audio', action: 'play', sound });
  };

  Sfx.die = play('die');
  Sfx.point = play('point');
  Sfx.swoosh = play('swoosh');
  Sfx.wing = play('wing');

  Sfx.hit = (cb?: IEmptyFunction) => {
    const callbackId = cb ? ++audioCallbackId : undefined;
    if (callbackId && cb) {
      audioCallbacks.set(callbackId, cb);
    }

    postWorkerMessage({
      type: 'audio',
      action: 'play',
      sound: 'hit',
      callbackId
    });
  };
};

const registerSprites = (sprites: SpriteBitmapTransfer[]) => {
  for (const { name, bitmap } of sprites) {
    SpriteDestructor.register(name, bitmap as SpriteAsset);
  }
};

const seedStorage = (entries: Record<string, IStoreValue | undefined>) => {
  for (const [key, value] of Object.entries(entries)) {
    Storage.primeFallback(key, value);
  }

  Storage.registerFallbackHandler((key, value) => {
    const message: WorkerStorageMessage = {
      type: 'storage',
      action: 'save',
      key,
      value
    };
    postWorkerMessage(message);
  });
};

let game: GameObject | undefined;
let framer: InstanceType<typeof Framer> | undefined;
let isDevelopment = false;
let lastFrame = 0;
const frameInterval = 1000 / 60;

const handleFrame = (time: number) => {
  if (!game) return;
  if (time - lastFrame < frameInterval) return;
  lastFrame = time;

  game.Update();
  game.Display();

  if (isDevelopment) {
    framer?.mark();
  }
};

const initializeGame = (data: WorkerInitMessage) => {
  bridgeAudio();
  registerSprites(data.sprites);
  new Storage();
  seedStorage(data.storage);

  game = new GameObject(data.canvas);
  game.init();
  game.Resize(data.size);

  framer = new Framer(game.context);
  framer.text({ x: 50, y: 50 }, '', ' Cycle');
  framer.container({ x: 10, y: 10 }, { x: 230, y: 70 });

  isDevelopment = data.isDev;
  lastFrame = 0;

  const ready: WorkerReadyMessage = { type: 'ready' };
  postWorkerMessage(ready);
};

const handlePointer = (message: MainToWorkerMessage) => {
  if (!game || message.type !== 'pointer') return;

  switch (message.kind) {
    case 'down':
      game.mouseDown(message.position);
      break;
    case 'up':
      game.mouseUp(message.position);
      break;
    case 'click':
      game.onClick(message.position);
      break;
  }
};

self.addEventListener('message', (event: MessageEvent<MainToWorkerMessage>) => {
  const data = event.data;

  switch (data.type) {
    case 'init':
      initializeGame(data);
      break;
    case 'frame':
      handleFrame(data.time);
      break;
    case 'resize':
      game?.Resize(data.size);
      break;
    case 'pointer':
      handlePointer(data);
      break;
    case 'keyboard':
      game?.startAtKeyBoardEvent();
      break;
    case 'audio-callback':
      if (audioCallbacks.has(data.id)) {
        const callback = audioCallbacks.get(data.id)!;
        audioCallbacks.delete(data.id);
        callback();
      }
      break;
  }
});
