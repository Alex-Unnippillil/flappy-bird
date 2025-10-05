// File Overview: This module belongs to types/custom.d.ts.
export {};

declare global {
  interface IDimension {
    width: number;
    height: number;
  }

  interface ICoordinate {
    x: number;
    y: number;
  }

  interface IVelocity {
    x: number;
    y: number;
  }

  type IEmptyFunction = (...args) => void;

  interface WindowEventMap {
    'game:pause': CustomEvent<{ paused: boolean }>;
  }
}
