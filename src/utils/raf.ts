const hasWindow = typeof window !== 'undefined';

type FrameHandle = number;

let requestFrame: (callback: FrameRequestCallback) => FrameHandle;
let cancelFrame: (handle: FrameHandle) => void;

if (hasWindow && typeof window.requestAnimationFrame === 'function') {
  requestFrame = window.requestAnimationFrame.bind(window);
  cancelFrame = window.cancelAnimationFrame.bind(window);
} else {
  let nextHandle = 1;
  const timeoutHandles = new Map<FrameHandle, ReturnType<typeof setTimeout>>();
  const now = () =>
    typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();

  requestFrame = (callback: FrameRequestCallback): FrameHandle => {
    const handle = nextHandle as FrameHandle;
    nextHandle += 1;
    const timeout = setTimeout(() => {
      timeoutHandles.delete(handle);
      callback(now());
    }, 1000 / 60);
    timeoutHandles.set(handle, timeout);
    return handle;
  };

  cancelFrame = (handle: FrameHandle): void => {
    const timeout = timeoutHandles.get(handle);
    if (timeout !== undefined) {
      clearTimeout(timeout);
      timeoutHandles.delete(handle);
    }
  };
}

export type RafController = [isRunning: () => boolean, start: () => void, stop: () => void];

export const createRAF = (callback: FrameRequestCallback): RafController => {
  let running = false;
  let handle: FrameHandle | null = null;

  const tick: FrameRequestCallback = (time) => {
    if (!running) {
      return;
    }
    callback(time);
    handle = requestFrame(tick);
  };

  const start = () => {
    if (running) {
      return;
    }
    running = true;
    handle = requestFrame(tick);
  };

  const stop = () => {
    if (!running) {
      return;
    }
    running = false;
    if (handle !== null) {
      cancelFrame(handle);
      handle = null;
    }
  };

  return [() => running, start, stop];
};

export const targetFPS = (callback: () => void, fps: number): FrameRequestCallback => {
  const frameDuration = fps > 0 ? 1000 / fps : 0;
  let accumulator = 0;
  let lastTimestamp = 0;

  return (time) => {
    if (!Number.isFinite(frameDuration) || frameDuration <= 0) {
      callback();
      return;
    }

    if (lastTimestamp === 0) {
      lastTimestamp = time;
    }

    accumulator += time - lastTimestamp;
    lastTimestamp = time;

    if (accumulator >= frameDuration) {
      accumulator %= frameDuration;
      callback();
    }
  };
};
