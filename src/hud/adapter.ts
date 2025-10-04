import { Medal } from "./medals";

export interface MedalEvent {
  medal: Medal;
  title?: string;
  description?: string;
  persistent?: boolean;
  durationMs?: number;
}

export type MedalListener = (event: MedalEvent) => void;

class HudAdapter {
  #medalListeners: Set<MedalListener> = new Set();

  onMedal(listener: MedalListener): () => void {
    this.#medalListeners.add(listener);
    return () => {
      this.#medalListeners.delete(listener);
    };
  }

  emitMedal(event: MedalEvent): void {
    for (const listener of this.#medalListeners) {
      listener(event);
    }
  }
}

export const hudAdapter = new HudAdapter();

export { Medal };
