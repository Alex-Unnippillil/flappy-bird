// File Overview: This module belongs to src/utils/waves.ts.
/**
 * f(x) = A • sin(((t / 1000) • 2 • PI) / (1 / B))
 *
 * where A is the Amplitude
 *       B is the Frequency
 *       t is time
 *
 * */

export interface IWaveState {
  phase: number;
}

export const createWaveState = (): IWaveState => ({ phase: 0 });

const FULL_ROTATION = Math.PI * 2;

const advancePhase = (state: IWaveState, delta: number, frequency: number): void => {
  const deltaSeconds = delta / 60;
  state.phase = (state.phase + FULL_ROTATION * frequency * deltaSeconds) % FULL_ROTATION;
  if (state.phase < 0) {
    state.phase += FULL_ROTATION;
  }
};

/**
 * Return wave value based on accumulated phase using sine. The delta parameter
 * is normalized against 60 FPS (delta === 1 === 16.66ms).
 */
export const sine = (
  state: IWaveState,
  delta: number,
  frequency: number,
  amplitude: number
): number => {
  advancePhase(state, delta, frequency);
  return Math.sin(state.phase) * amplitude;
};

/**
 * Return wave value based on accumulated phase using cosine. The delta parameter
 * is normalized against 60 FPS (delta === 1 === 16.66ms).
 */
export const cosine = (
  state: IWaveState,
  delta: number,
  frequency: number,
  amplitude: number
): number => {
  advancePhase(state, delta, frequency);
  return Math.cos(state.phase) * amplitude;
};
