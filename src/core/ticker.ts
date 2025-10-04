export interface Ticker {
  now(): number;
}

class PerformanceTicker implements Ticker {
  now(): number {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      return performance.now();
    }
    return Date.now();
  }
}

let activeTicker: Ticker = new PerformanceTicker();

export function getTicker(): Ticker {
  return activeTicker;
}

export function setTicker(ticker: Ticker | null | undefined): void {
  if (ticker) {
    activeTicker = ticker;
    return;
  }
  activeTicker = new PerformanceTicker();
}

export function resetTicker(): void {
  setTicker(undefined);
}

export type { Ticker as CoreTicker };
