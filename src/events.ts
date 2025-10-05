// File Overview: This module belongs to src/events.ts.
/**
 * Interactive
 */

import Game from './game';
import WebSfx from './lib/web-sfx';
import { clamp } from './utils';

export type IEventParam = MouseEvent | TouchEvent | KeyboardEvent | PointerEvent;

export default (Game: Game, canvas: HTMLCanvasElement) => {
  interface IMouse {
    down: boolean;
    position: ICoordinate;
    pressure: number;
  }

  let clicked = false;

  // Trigger the event once
  let hasMouseDown = false;
  let hasMouseUp = true;

  const mouse: IMouse = {
    down: false,
    position: {
      x: 0,
      y: 0
    },
    pressure: 1
  };

  const supportsPointerEvents = typeof window !== 'undefined' && 'PointerEvent' in window;

  const getNormalizedPressure = (evt: IEventParam): number => {
    if (supportsPointerEvents && evt instanceof PointerEvent) {
      if (evt.pointerType === 'pen') {
        return clamp(0, 1, evt.pressure ?? 0);
      }

      if (evt.pointerType === 'touch') {
        return clamp(0, 1, evt.pressure ?? 0);
      }

      return 1;
    }

    if ('touches' in evt && evt.touches.length > 0) {
      const force = evt.touches[0].force;
      if (typeof force === 'number' && force > 0) {
        return clamp(0, 1, force);
      }
    }

    return 1;
  };

  const getBoundedPosition = ({ x, y }: ICoordinate): ICoordinate => {
    const { left, top, width, height } = canvas.getBoundingClientRect();
    const dx: number = ((x - left) / width) * canvas.width;
    const dy: number = ((y - top) / height) * canvas.height;

    return { x: dx, y: dy };
  };

  const likeClickedEvent = () => {
    if (clicked) return;

    Game.onClick(mouse.position, mouse.pressure);
    clicked = true;
  };

  const mouseMove = ({ x, y }: ICoordinate, evt: IEventParam): void => {
    evt.preventDefault();
    mouse.position = getBoundedPosition({ x, y });
    const nextPressure = getNormalizedPressure(evt);
    if (Number.isFinite(nextPressure)) {
      mouse.pressure = nextPressure;
    }
  };

  const mouseUP = (
    { x, y }: ICoordinate,
    evt: IEventParam,
    isRetreive: boolean
  ): void => {
    if (hasMouseUp) return;
    hasMouseUp = true;
    hasMouseDown = false;

    /**
     * Required due to autoplay restriction
     * */
    void WebSfx.init();

    evt.preventDefault();
    if (!isRetreive) mouse.position = getBoundedPosition({ x, y });
    mouse.pressure = 1;

    Game.mouseUp(mouse.position);
    mouse.down = false;
    clicked = false;
  };

  const mouseDown = ({ x, y }: ICoordinate, evt: IEventParam): void => {
    if (hasMouseDown) return;
    hasMouseUp = false;
    hasMouseDown = true;

    /**
     * Trigger multiple times
     * Required due to autoplay restriction
     * */
    void WebSfx.init();

    evt.preventDefault();
    mouse.position = getBoundedPosition({ x, y });
    const normalizedPressure = getNormalizedPressure(evt);
    mouse.pressure = Number.isFinite(normalizedPressure) ? normalizedPressure : 1;
    Game.mouseDown(mouse.position, mouse.pressure);
    mouse.down = true;

    likeClickedEvent();
  };

  if (supportsPointerEvents) {
    canvas.addEventListener('pointerdown', (evt: PointerEvent) => {
      if (typeof canvas.setPointerCapture === 'function') {
        try {
          canvas.setPointerCapture(evt.pointerId);
        } catch (_error) {
          // Ignore capture errors (e.g. unsupported pointer types)
        }
      }

      mouseDown({ x: evt.clientX, y: evt.clientY }, evt);
    });

    canvas.addEventListener('pointerup', (evt: PointerEvent) => {
      mouseUP({ x: evt.clientX, y: evt.clientY }, evt, false);
    });

    canvas.addEventListener('pointercancel', (evt: PointerEvent) => {
      mouseUP({ x: evt.clientX, y: evt.clientY }, evt, false);
    });

    canvas.addEventListener('pointermove', (evt: PointerEvent) => {
      mouseMove({ x: evt.clientX, y: evt.clientY }, evt);
    });
  } else {
    // Mouse Event
    canvas.addEventListener('mousedown', (evt: MouseEvent) => {
      mouseDown({ x: evt.clientX, y: evt.clientY }, evt);
    });

    canvas.addEventListener('mouseup', (evt: MouseEvent) => {
      mouseUP({ x: evt.clientX, y: evt.clientY }, evt, false);
    });

    canvas.addEventListener('mousemove', (evt: MouseEvent) => {
      mouseMove({ x: evt.clientX, y: evt.clientY }, evt);
    });

    // Touch Event
    canvas.addEventListener('touchstart', (evt: TouchEvent) => {
      mouseDown({ x: evt.touches[0].clientX, y: evt.touches[0].clientY }, evt);
    });

    canvas.addEventListener('touchend', (evt: TouchEvent) => {
      if (evt.touches.length < 1) {
        mouseUP(mouse.position, evt, true);
        return;
      }

      mouseUP({ x: evt.touches[0].clientX, y: evt.touches[0].clientY }, evt, false);
    });

    canvas.addEventListener('touchmove', (evt: TouchEvent) => {
      mouseMove({ x: evt.touches[0].clientX, y: evt.touches[0].clientY }, evt);
    });
  }

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

      mouseDown(
        {
          x: canvas.width / 2,
          y: canvas.height / 2
        },
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
      mouseUP(
        {
          x: canvas.width / 2,
          y: canvas.height / 2
        },
        evt,
        false
      );
    }
  });
};
