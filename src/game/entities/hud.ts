const BEST_SCORE_STORAGE_KEY = "flappyBird.bestScore";

function readStoredBestScore(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  try {
    const value = window.localStorage.getItem(BEST_SCORE_STORAGE_KEY);
    if (value === null) {
      return 0;
    }

    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch (error) {
    console.warn("Unable to read best score from localStorage.", error);
    return 0;
  }
}

function storeBestScore(score: number): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(score));
  } catch (error) {
    console.warn("Unable to persist best score to localStorage.", error);
  }
}

export class HUD {
  private readonly root: HTMLElement;

  private readonly scoreValueEl: HTMLElement;

  private readonly bestScoreValueEl: HTMLElement;

  private readonly pauseIndicatorEl: HTMLElement;

  private readonly fpsToggleButton: HTMLButtonElement;

  private readonly fpsValueEl: HTMLElement;

  private bestScore: number;

  private fpsEnabled: boolean;

  constructor(root: HTMLElement) {
    this.root = root;
    this.root.innerHTML = "";
    this.root.classList.add("hud");
    this.root.setAttribute("role", "presentation");

    this.bestScore = readStoredBestScore();
    this.fpsEnabled = false;

    const topRow = document.createElement("div");
    topRow.className = "hud__top";
    this.root.append(topRow);

    const scoreBoard = document.createElement("div");
    scoreBoard.className = "hud__scoreboard";
    topRow.append(scoreBoard);

    const scoreLabel = document.createElement("span");
    scoreLabel.className = "hud__label";
    scoreLabel.textContent = "Score";
    scoreBoard.append(scoreLabel);

    this.scoreValueEl = document.createElement("span");
    this.scoreValueEl.className = "hud__value";
    this.scoreValueEl.textContent = "0";
    scoreBoard.append(this.scoreValueEl);

    const bestBoard = document.createElement("div");
    bestBoard.className = "hud__scoreboard";
    topRow.append(bestBoard);

    const bestLabel = document.createElement("span");
    bestLabel.className = "hud__label";
    bestLabel.textContent = "Best";
    bestBoard.append(bestLabel);

    this.bestScoreValueEl = document.createElement("span");
    this.bestScoreValueEl.className = "hud__value";
    this.bestScoreValueEl.textContent = String(this.bestScore);
    bestBoard.append(this.bestScoreValueEl);

    const controlGroup = document.createElement("div");
    controlGroup.className = "hud__controls";
    topRow.append(controlGroup);

    this.fpsToggleButton = document.createElement("button");
    this.fpsToggleButton.type = "button";
    this.fpsToggleButton.className = "hud__fps-toggle";
    this.fpsToggleButton.textContent = "Show FPS";
    this.fpsToggleButton.setAttribute("aria-pressed", "false");
    controlGroup.append(this.fpsToggleButton);

    this.fpsValueEl = document.createElement("span");
    this.fpsValueEl.className = "hud__fps-value";
    this.fpsValueEl.setAttribute("hidden", "");
    controlGroup.append(this.fpsValueEl);

    this.pauseIndicatorEl = document.createElement("div");
    this.pauseIndicatorEl.className = "hud__pause";
    this.pauseIndicatorEl.textContent = "Paused";
    this.pauseIndicatorEl.setAttribute("aria-hidden", "true");
    this.root.append(this.pauseIndicatorEl);
  }

  setScore(score: number): void {
    this.scoreValueEl.textContent = String(Math.max(0, Math.floor(score)));

    if (score > this.bestScore) {
      this.updateBestScore(score, true);
    }
  }

  setBestScore(score: number): void {
    this.updateBestScore(score, false);
  }

  getBestScore(): number {
    return this.bestScore;
  }

  setPaused(paused: boolean, message = "Paused"): void {
    this.pauseIndicatorEl.textContent = message;
    if (paused) {
      this.pauseIndicatorEl.classList.add("is-visible");
      this.pauseIndicatorEl.setAttribute("aria-hidden", "false");
    } else {
      this.pauseIndicatorEl.classList.remove("is-visible");
      this.pauseIndicatorEl.setAttribute("aria-hidden", "true");
    }
  }

  setFpsEnabled(enabled: boolean): void {
    this.fpsEnabled = enabled;
    this.fpsToggleButton.textContent = enabled ? "Hide FPS" : "Show FPS";
    this.fpsToggleButton.setAttribute("aria-pressed", String(enabled));

    if (!enabled) {
      this.setFps(null);
    }
  }

  getFpsEnabled(): boolean {
    return this.fpsEnabled;
  }

  onFpsToggle(handler: (enabled: boolean) => void): void {
    this.fpsToggleButton.addEventListener("click", () => {
      this.setFpsEnabled(!this.fpsEnabled);
      handler(this.fpsEnabled);
    });
  }

  setFps(value: number | null): void {
    if (value === null || Number.isNaN(value)) {
      this.fpsValueEl.textContent = "";
      this.fpsValueEl.setAttribute("hidden", "");
      return;
    }

    this.fpsValueEl.textContent = `${Math.round(value)} FPS`;
    this.fpsValueEl.removeAttribute("hidden");
  }

  private updateBestScore(score: number, persist: boolean): void {
    const normalized = Math.max(0, Math.floor(score));
    this.bestScore = normalized;
    this.bestScoreValueEl.textContent = String(normalized);
    if (persist) {
      storeBestScore(normalized);
    }
  }
}

export { BEST_SCORE_STORAGE_KEY };
