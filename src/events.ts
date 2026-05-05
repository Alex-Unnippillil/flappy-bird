/**
 * Centralizes user input for the game canvas by mapping pointer and keyboard
 * events onto a shared "mouse" state that Game consumes. Pointer coordinates
 * are translated from viewport space to canvas space via
 * `getBoundingClientRect` so Game always receives device-independent values.
 * Repeated presses are debounced through `likeClickedEvent`, which only
 * forwards the first press in a down/up cycle to `Game.onClick` so score
 * screens behave consistently. Each first interaction for a press also calls
 * `WebSfx.init()` to unlock audio playback (required by some browsers) before
 * delegating to `Game.mouseDown`/`Game.mouseUp`.
 */

import Game from './game';
import WebSfx from './lib/web-sfx';

export type IEventParam = PointerEvent | KeyboardEvent;

export default (Game: Game, canvas: HTMLCanvasElement) => {
  interface IMouse {
    down: boolean;
    position: ICoordinate;
  }

  let clicked = false;

  // Trigger each phase once per physical press cycle.
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

  const applyPosition = ({ x, y }: ICoordinate) => {
    mouse.position = getBoundedPosition({ x, y });
  };

  const press = ({ x, y }: ICoordinate) => {
    if (hasMouseDown) return;

    hasMouseDown = true;
    hasMouseUp = false;

    void WebSfx.init();

    applyPosition({ x, y });
    mouse.down = true;
    Game.mouseDown(mouse.position);

    likeClickedEvent();
  };

  const release = ({ x, y }: ICoordinate) => {
    if (hasMouseUp) return;

    hasMouseUp = true;
    hasMouseDown = false;

    void WebSfx.init();

    applyPosition({ x, y });
    mouse.down = false;
    Game.mouseUp(mouse.position);
    clicked = false;
  };

  const move = ({ x, y }: ICoordinate) => {
    applyPosition({ x, y });
  };

  canvas.addEventListener('pointerdown', (evt: PointerEvent) => {
    press({ x: evt.clientX, y: evt.clientY });
  });

  canvas.addEventListener('pointerup', (evt: PointerEvent) => {
    release({ x: evt.clientX, y: evt.clientY });
  });

  canvas.addEventListener('pointercancel', (evt: PointerEvent) => {
    release({ x: evt.clientX, y: evt.clientY });
  });

  canvas.addEventListener('pointermove', (evt: PointerEvent) => {
    move({ x: evt.clientX, y: evt.clientY });
  });

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

      evt.preventDefault();
      press({
        x: canvas.width / 2,
        y: canvas.height / 2
      });
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
      evt.preventDefault();
      release({
        x: canvas.width / 2,
        y: canvas.height / 2
      });
    }
  });
};
