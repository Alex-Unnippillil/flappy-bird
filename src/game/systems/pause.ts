export interface PauseState {
  paused: boolean;
  stepRequested: boolean;
}

export function createPauseState(): PauseState {
  return {
    paused: false,
    stepRequested: false,
  };
}

export function resetPauseState(state: PauseState): void {
  state.paused = false;
  state.stepRequested = false;
}

export function togglePause(state: PauseState): boolean {
  state.paused = !state.paused;
  if (!state.paused) {
    state.stepRequested = false;
  }
  return state.paused;
}

export function requestStep(state: PauseState): void {
  if (state.paused) {
    state.stepRequested = true;
  }
}

export function shouldProcessFrame(state: PauseState): boolean {
  if (!state.paused) {
    return true;
  }

  if (state.stepRequested) {
    state.stepRequested = false;
    return true;
  }

  return false;
}

export function isPaused(state: PauseState): boolean {
  return state.paused;
}
