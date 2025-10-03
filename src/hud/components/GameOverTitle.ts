import "../styles/game-over-title.css";

type GameOverTitleController = {
  element: HTMLElement;
  show(): void;
  hide(): void;
};

export function createGameOverTitle(): GameOverTitleController {
  const container = document.createElement("header");
  container.className = "game-over-title";
  container.setAttribute("aria-hidden", "true");
  container.hidden = true;

  const eyebrow = document.createElement("span");
  eyebrow.className = "game-over-title__eyebrow";
  eyebrow.textContent = "Flappy Bird 3D";

  const heading = document.createElement("h2");
  heading.className = "game-over-title__heading";
  heading.textContent = "Game ";

  const accent = document.createElement("span");
  accent.className = "game-over-title__accent";
  accent.textContent = "Over";

  heading.appendChild(accent);
  container.append(eyebrow, heading);

  return {
    element: container,
    show() {
      container.hidden = false;
      container.setAttribute("aria-hidden", "false");
    },
    hide() {
      container.hidden = true;
      container.setAttribute("aria-hidden", "true");
    },
  };
}
