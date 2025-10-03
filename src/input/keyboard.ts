export type KeyboardHandlers = {
  onFlap: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
};

export function setupKeyboardControls(
  canvas: HTMLCanvasElement,
  handlers: KeyboardHandlers
): () => void {
  const { onFlap, onTogglePause, onRestart } = handlers;

  if (canvas.tabIndex < 0) {
    canvas.tabIndex = 0;
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.code) {
      case "Space":
        event.preventDefault();
        onFlap();
        break;
      case "KeyP":
        event.preventDefault();
        onTogglePause();
        break;
      case "KeyR":
        event.preventDefault();
        onRestart();
        break;
      default:
        break;
    }
  };

  canvas.addEventListener("keydown", handleKeyDown);

  return () => {
    canvas.removeEventListener("keydown", handleKeyDown);
  };
}
