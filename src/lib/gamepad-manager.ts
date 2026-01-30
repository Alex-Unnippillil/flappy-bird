// File Overview: This module belongs to src/lib/gamepad-manager.ts.
export interface IGamepadManagerCallbacks {
  onPrimaryDown: () => void;
  onPrimaryUp: () => void;
  onStart?: () => void;
  onConnectionChange?: (connected: boolean, pad: Gamepad | null) => void;
}

const isButtonPressed = (button: GamepadButton | undefined): boolean => {
  if (!button) return false;
  return button.pressed || button.value > 0.5;
};

export default class GamepadManager {
  private activeIndex: number | null;
  private rafId: number | null;
  private lastPrimaryPressed: boolean;
  private lastStartPressed: boolean;
  private lastConnected: boolean;
  private lastGamepadId: string | null;

  constructor(private readonly callbacks: IGamepadManagerCallbacks) {
    this.activeIndex = null;
    this.rafId = null;
    this.lastPrimaryPressed = false;
    this.lastStartPressed = false;
    this.lastConnected = false;
    this.lastGamepadId = null;
  }

  public init(): void {
    window.addEventListener('gamepadconnected', this.handleConnected);
    window.addEventListener('gamepaddisconnected', this.handleDisconnected);

    this.updateActiveGamepad();
  }

  public start(): void {
    if (this.rafId !== null) return;

    const tick = () => {
      this.poll();
      this.rafId = window.requestAnimationFrame(tick);
    };

    this.rafId = window.requestAnimationFrame(tick);
  }

  private handleConnected = (evt: GamepadEvent): void => {
    if (this.activeIndex === null) {
      this.activeIndex = evt.gamepad.index;
    }

    this.updateActiveGamepad();
  };

  private handleDisconnected = (evt: GamepadEvent): void => {
    if (this.activeIndex === evt.gamepad.index) {
      const fallback = this.findFirstConnected(evt.gamepad.index);
      this.activeIndex = fallback?.index ?? null;
    }

    this.updateActiveGamepad();
  };

  private poll(): void {
    const pad = this.updateActiveGamepad();

    if (!pad) {
      if (this.lastPrimaryPressed) {
        this.callbacks.onPrimaryUp();
      }

      this.lastPrimaryPressed = false;
      this.lastStartPressed = false;
      return;
    }

    const primaryPressed = isButtonPressed(pad.buttons[0]);

    if (primaryPressed && !this.lastPrimaryPressed) {
      this.callbacks.onPrimaryDown();
    } else if (!primaryPressed && this.lastPrimaryPressed) {
      this.callbacks.onPrimaryUp();
    }

    this.lastPrimaryPressed = primaryPressed;

    if (typeof this.callbacks.onStart === 'function') {
      const startPressed = isButtonPressed(pad.buttons[9]);

      if (startPressed && !this.lastStartPressed) {
        this.callbacks.onStart();
      }

      this.lastStartPressed = startPressed;
    }
  }

  private updateActiveGamepad(): Gamepad | null {
    const pads = this.readGamepads();

    let pad: Gamepad | null = null;

    const active = this.activeIndex !== null ? pads[this.activeIndex] ?? null : null;
    if (active?.connected) {
      pad = active;
    }

    if (!pad) {
      const fallback = this.findFirstConnected();
      if (fallback) {
        pad = fallback;
        this.activeIndex = fallback.index;
      } else {
        this.activeIndex = null;
      }
    }

    this.notifyConnectionChange(pad);

    return pad;
  }

  private findFirstConnected(excludeIndex?: number): Gamepad | null {
    const pads = this.readGamepads();

    for (const pad of pads) {
      if (!pad?.connected) continue;
      if (typeof excludeIndex === 'number' && pad.index === excludeIndex) continue;
      return pad;
    }

    return null;
  }

  private notifyConnectionChange(pad: Gamepad | null): void {
    const connected = Boolean(pad);
    const id = pad?.id ?? null;

    if (
      connected !== this.lastConnected ||
      (connected && id !== this.lastGamepadId)
    ) {
      this.callbacks.onConnectionChange?.(connected, pad ?? null);
    }

    this.lastConnected = connected;
    this.lastGamepadId = id;
  }

  private readGamepads(): readonly (Gamepad | null)[] {
    const nav = navigator as Navigator & {
      getGamepads?: () => readonly (Gamepad | null)[];
    };

    if (typeof nav.getGamepads !== 'function') return [];

    try {
      return nav.getGamepads();
    } catch {
      return [];
    }
  }
}
