export { CONFIG, createGameState, resetGameState } from "./state";
export type { GameState } from "./state";
export {
  createPauseState,
  resetPauseState,
  togglePause,
  requestStep,
  shouldProcessFrame,
  isPaused,
} from "./pause";
export type { PauseState } from "./pause";
