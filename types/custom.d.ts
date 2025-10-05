// Provides shared geometry interfaces and utility function signatures consumed across the game codebase.
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

// Add new global interfaces here using the existing `I`-prefixed naming so shared ambient types stay consistent.
