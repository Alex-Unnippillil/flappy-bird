// File Overview: This module belongs to src/events.ts.
/**
 * Interactive
 */

import Game from './game';
import WebSfx from './lib/web-sfx';

interface IActivePointerState {
  down: boolean;
  clicked: boolean;
  details: IPointerDetails;
}

const SYNTHETIC_POINTER_ID = -1;

export default (Game: Game, canvas: HTMLCanvasElement) => {
  const activePointers = new Map<number, IActivePointerState>();

  canvas.style.touchAction = 'none';

  const getBoundedPosition = ({ x, y }: ICoordinate): ICoordinate => {
    const { left, top, width, height } = canvas.getBoundingClientRect();
    const dx: number = ((x - left) / width) * canvas.width;
    const dy: number = ((y - top) / height) * canvas.height;

    return { x: dx, y: dy };
  };

  const buildPointerDetails = (evt: PointerEvent): IPointerDetails => {
    const position = getBoundedPosition({ x: evt.clientX, y: evt.clientY });

    return {
      ...position,
      pointerId: evt.pointerId,
      pointerType: evt.pointerType,
      pressure: evt.pressure,
      tangentialPressure: evt.tangentialPressure,
      tiltX: evt.tiltX,
      tiltY: evt.tiltY,
      twist: evt.twist,
      altitudeAngle: evt.altitudeAngle,
      azimuthAngle: evt.azimuthAngle,
      width: evt.width,
      height: evt.height,
      isPrimary: evt.isPrimary
    };
  };

  const ensurePointerState = (
    pointerId: number,
    details: IPointerDetails
  ): IActivePointerState => {
    const existing = activePointers.get(pointerId);
    if (existing !== undefined) {
      existing.details = details;
      return existing;
    }

    const state: IActivePointerState = {
      down: false,
      clicked: false,
      details
    };

    activePointers.set(pointerId, state);
    return state;
  };

  const triggerClick = (pointerId: number): void => {
    const state = activePointers.get(pointerId);
    if (!state || state.clicked) return;

    Game.onClick(state.details);
    state.clicked = true;
  };

  const pointerMove = (
    pointerId: number,
    details: IPointerDetails,
    evt?: Event
  ): void => {
    if (evt) evt.preventDefault();
    ensurePointerState(pointerId, details);
  };

  const pointerDown = (
    pointerId: number,
    details: IPointerDetails,
    evt?: Event
  ): void => {
    const state = ensurePointerState(pointerId, details);

    /**
     * Trigger multiple times
     * Required due to autoplay restriction
     * */
    void WebSfx.init();

    if (evt) evt.preventDefault();

    state.down = true;
    state.details = details;
    state.clicked = false;

    Game.mouseDown(details);
    triggerClick(pointerId);
  };

  const pointerUp = (
    pointerId: number,
    details: IPointerDetails,
    evt?: Event
  ): void => {
    const state = ensurePointerState(pointerId, details);

    /**
     * Required due to autoplay restriction
     * */
    void WebSfx.init();

    if (evt) evt.preventDefault();

    state.down = false;
    state.clicked = false;
    state.details = details;

    Game.mouseUp(details);

    activePointers.delete(pointerId);
  };

  const pointerCancel = (pointerId: number, evt?: Event): void => {
    const state = activePointers.get(pointerId);
    if (!state) return;

    if (evt) evt.preventDefault();

    state.down = false;
    state.clicked = false;

    Game.mouseUp(state.details);
    activePointers.delete(pointerId);
  };

  const createSyntheticPointerDetails = ({ x, y }: ICoordinate): IPointerDetails => ({
    x,
    y,
    pointerId: SYNTHETIC_POINTER_ID,
    pointerType: 'keyboard',
    pressure: 1,
    isPrimary: true
  });

  canvas.addEventListener(
    'pointerdown',
    (evt: PointerEvent) => {
      const details = buildPointerDetails(evt);
      pointerMove(evt.pointerId, details, evt);
      pointerDown(evt.pointerId, details, evt);
    },
    { passive: false }
  );

  canvas.addEventListener(
    'pointermove',
    (evt: PointerEvent) => {
      pointerMove(evt.pointerId, buildPointerDetails(evt), evt);
    },
    { passive: false }
  );

  canvas.addEventListener(
    'pointerup',
    (evt: PointerEvent) => {
      pointerUp(evt.pointerId, buildPointerDetails(evt), evt);
    },
    { passive: false }
  );

  canvas.addEventListener(
    'pointercancel',
    (evt: PointerEvent) => {
      pointerCancel(evt.pointerId, evt);
    },
    { passive: false }
  );

  // Keyboard event
  document.addEventListener('keydown', (evt: KeyboardEvent) => {
    const { key, keyCode, code } = evt;

    if (
      key === ' ' ||
      keyCode === 32 ||
      code === 'Space' ||
      key === 'Enter' ||
      keyCode === 13 ||
      code === 'NumpadEnter' ||
      code === 'Enter'
    ) {
      Game.startAtKeyBoardEvent();

      pointerDown(
        SYNTHETIC_POINTER_ID,
        createSyntheticPointerDetails({
          x: canvas.width / 2,
          y: canvas.height / 2
        }),
        evt
      );
    }
  });

  document.addEventListener('keyup', (evt: KeyboardEvent) => {
    const { key, keyCode, code } = evt;
    if (
      key === ' ' ||
      keyCode === 32 ||
      code === 'Space' ||
      key === 'Enter' ||
      keyCode === 13 ||
      code === 'NumpadEnter' ||
      code === 'Enter'
    ) {
      pointerUp(
        SYNTHETIC_POINTER_ID,
        createSyntheticPointerDetails({
          x: canvas.width / 2,
          y: canvas.height / 2
        }),
        evt
      );
    }
  });
};
