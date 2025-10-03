import type { GameState } from '../game/systems/state.js';

export interface Renderer {
  setup(state: GameState): void;
  renderFrame(state: GameState): void;
}
