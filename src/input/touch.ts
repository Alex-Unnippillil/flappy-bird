const LONG_PRESS_DURATION_MS = 300;

export interface TouchControlsConfig {
  canvas: HTMLCanvasElement;
  onFlap: () => void;
  onRestart: () => void;
  isGameActive: () => boolean;
}

export type RemoveTouchControls = () => void;

export function registerTouchControls({
  canvas,
  onFlap,
  onRestart,
  isGameActive,
}: TouchControlsConfig): RemoveTouchControls {
  let touchStartTime: number | null = null;
  let activeTouchId: number | null = null;

  const eventOptions: AddEventListenerOptions = { passive: false };

  const resetTouchTracking = () => {
    touchStartTime = null;
    activeTouchId = null;
  };

  const preventScrollWhenActive = (event: TouchEvent) => {
    if (isGameActive()) {
      event.preventDefault();
    }
  };

  const handleTouchStart = (event: TouchEvent) => {
    if (event.touches.length !== 1) {
      resetTouchTracking();
      return;
    }

    const touch = event.touches[0];
    activeTouchId = touch.identifier;
    touchStartTime = performance.now();

    preventScrollWhenActive(event);
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (activeTouchId === null) {
      return;
    }

    preventScrollWhenActive(event);
  };

  const handleTouchEnd = (event: TouchEvent) => {
    if (activeTouchId === null) {
      return;
    }

    const relevantTouch = Array.from(event.changedTouches).find(
      (touch) => touch.identifier === activeTouchId,
    );

    if (!relevantTouch) {
      return;
    }

    const elapsed =
      touchStartTime === null ? Number.POSITIVE_INFINITY : performance.now() - touchStartTime;

    if (elapsed <= LONG_PRESS_DURATION_MS) {
      if (isGameActive()) {
        preventScrollWhenActive(event);
        onFlap();
      } else {
        onRestart();
      }
    }

    resetTouchTracking();
  };

  const handleTouchCancel = () => {
    resetTouchTracking();
  };

  canvas.addEventListener("touchstart", handleTouchStart, eventOptions);
  canvas.addEventListener("touchmove", handleTouchMove, eventOptions);
  canvas.addEventListener("touchend", handleTouchEnd, eventOptions);
  canvas.addEventListener("touchcancel", handleTouchCancel, eventOptions);

  return () => {
    canvas.removeEventListener("touchstart", handleTouchStart, eventOptions);
    canvas.removeEventListener("touchmove", handleTouchMove, eventOptions);
    canvas.removeEventListener("touchend", handleTouchEnd, eventOptions);
    canvas.removeEventListener("touchcancel", handleTouchCancel, eventOptions);
  };
}
