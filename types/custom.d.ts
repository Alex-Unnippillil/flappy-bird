// File Overview: This module belongs to types/custom.d.ts.
interface IDimension {
  width: number;
  height: number;
}

interface ICoordinate {
  x: number;
  y: number;
}

interface IPointerDetails extends ICoordinate {
  pointerId?: number;
  pointerType?: string;
  pressure?: number;
  tangentialPressure?: number;
  tiltX?: number;
  tiltY?: number;
  twist?: number;
  altitudeAngle?: number;
  azimuthAngle?: number;
  width?: number;
  height?: number;
  isPrimary?: boolean;
}

interface IVelocity {
  x: number;
  y: number;
}

type IEmptyFunction = (...args) => void;
