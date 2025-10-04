import "./styles/layout.css";

const DEFAULT_SELECTORS = {
  root: "[data-hud-root]",
  panel: ".hud-panel",
  stage: ".game-stage",
  footer: ".game-footer",
  score: "#scoreValue",
  best: "#bestValue",
  message: "#gameMessage",
  overlay: "#gameOverlay",
  startButton: "#startButton",
  speedBar: "#speedFill",
  speedProgress: "#speedProgress",
};

function resolveElement(selector, context = document) {
  if (!selector) return null;
  if (selector instanceof Element) return selector;
  return context.querySelector(selector);
}

export class HudRoot {
  constructor(selectors = {}) {
    this.selectors = { ...DEFAULT_SELECTORS, ...selectors };
    this.root = resolveElement(this.selectors.root);

    if (!this.root) {
      throw new Error("HUD root element not found");
    }

    this.root.classList.add("hud-root");

    this.panel = resolveElement(this.selectors.panel, this.root);
    this.stage = resolveElement(this.selectors.stage, this.root);
    this.footer = resolveElement(this.selectors.footer, this.root);

    this.elements = {
      score: resolveElement(this.selectors.score, this.root),
      best: resolveElement(this.selectors.best, this.root),
      message: resolveElement(this.selectors.message, this.root),
      overlay: resolveElement(this.selectors.overlay, this.root),
      startButton: resolveElement(this.selectors.startButton, this.root),
      speedBar: resolveElement(this.selectors.speedBar, this.root),
      speedProgress: resolveElement(this.selectors.speedProgress, this.root),
    };
  }

  getElements() {
    return { ...this.elements };
  }
}
