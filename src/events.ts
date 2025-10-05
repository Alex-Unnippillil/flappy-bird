// File Overview: This module belongs to src/events.ts.
/**
 * Interactive
 */

import Game from './game';
import WebSfx from './lib/web-sfx';

const ALWAYS_ALLOWED_CODES = new Set(['NumpadEnter']);
const FALLBACK_CODES = ['Space', 'Enter', 'ArrowUp', 'KeyW'];

const KEYCODE_LOOKUP: Record<number, string> = {
  13: 'Enter',
  32: 'Space',
  38: 'ArrowUp',
  87: 'KeyW'
};

const normalizeKeyFromEvent = (evt: KeyboardEvent): string => {
  if (evt.code) return evt.code;
  const legacy = KEYCODE_LOOKUP[evt.keyCode];
  if (legacy) return legacy;
  if (evt.key === ' ' || evt.key === 'Spacebar') return 'Space';
  if (evt.key) return evt.key;
  return '';
};

export interface IEventController {
  updateKeyBindings: (codes: string[]) => void;
}

export type IEventParam = MouseEvent | TouchEvent | KeyboardEvent;

export default (Game: Game, canvas: HTMLCanvasElement, initialCodes: string[] = []): IEventController => {
  interface IMouse {
    down: boolean;
    position: ICoordinate;
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
    }
  };

  const getBoundedPosition = ({ x, y }: ICoordinate): ICoordinate => {
    const { left, top, width, height } = canvas.getBoundingClientRect();
    const dx: number = ((x - left) / width) * canvas.width;
    const dy: number = ((y - top) / height) * canvas.height;

    return { x: dx, y: dy };
  };

  const likeClickedEvent = () => {
    if (clicked) return;

    Game.onClick(mouse.position);
    clicked = true;
  };

  const mouseMove = ({ x, y }: ICoordinate, evt: IEventParam): void => {
    evt.preventDefault();
    mouse.position = getBoundedPosition({ x, y });
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
    Game.mouseDown(mouse.position);
    mouse.down = true;

    likeClickedEvent();
  };

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

  let activeCodes = new Set<string>([
    ...(initialCodes.length > 0 ? initialCodes : FALLBACK_CODES),
    ...Array.from(ALWAYS_ALLOWED_CODES)
  ]);

  const matchesActiveKey = (evt: KeyboardEvent): boolean => {
    const normalized = normalizeKeyFromEvent(evt);
    if (normalized && activeCodes.has(normalized)) return true;

    const lowerKey = evt.key?.toLowerCase();
    if (!lowerKey) return false;

    if (lowerKey === 'w' && activeCodes.has('KeyW')) return true;
    if (lowerKey === 'enter' && (activeCodes.has('Enter') || activeCodes.has('NumpadEnter'))) return true;
    if ((lowerKey === ' ' || lowerKey === 'spacebar') && activeCodes.has('Space')) return true;
    if (lowerKey === 'arrowup' && activeCodes.has('ArrowUp')) return true;

    return false;
  };

  const handleKeyDown = (evt: KeyboardEvent) => {
    if (!matchesActiveKey(evt)) return;

    Game.startAtKeyBoardEvent();

    mouseDown(
      {
        x: canvas.width / 2,
        y: canvas.height / 2
      },
      evt
    );
  };

  const handleKeyUp = (evt: KeyboardEvent) => {
    if (!matchesActiveKey(evt)) return;

    mouseUP(
      {
        x: canvas.width / 2,
        y: canvas.height / 2
      },
      evt,
      false
    );
  };

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);

  return {
    updateKeyBindings: (codes: string[]) => {
      const sanitized = Array.from(
        new Set(
          [...codes, ...Array.from(ALWAYS_ALLOWED_CODES)].filter(
            (code) => typeof code === 'string' && code.length > 0
          )
        )
      );

      if (sanitized.length < 1) {
        activeCodes = new Set<string>([
          ...FALLBACK_CODES,
          ...Array.from(ALWAYS_ALLOWED_CODES)
        ]);
        return;
      }

      activeCodes = new Set<string>(sanitized);
    }
  };
};
