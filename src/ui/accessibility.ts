const KEYBOARD_NAVIGATION_KEYS = new Set([
  "Tab",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Enter",
  "Space",
  " ",
  "Spacebar"
]);

const FOCUS_RING_CLASS = "focus-ring-visible";

function isKeyboardNavigationEvent(event: KeyboardEvent): boolean {
  return KEYBOARD_NAVIGATION_KEYS.has(event.key);
}

function ensureCanvasIsFocusable(canvas: HTMLCanvasElement): void {
  if (canvas.tabIndex < 0) {
    canvas.tabIndex = 0;
  }
}

export function initAccessibility(canvas: HTMLCanvasElement): () => void {
  ensureCanvasIsFocusable(canvas);

  const root = document.body;

  if (!root) {
    return () => {
      /* noop */
    };
  }

  const showFocusRing = () => {
    root.classList.add(FOCUS_RING_CLASS);
  };

  const hideFocusRing = () => {
    root.classList.remove(FOCUS_RING_CLASS);
  };

  const handleKeyboardInput = (event: KeyboardEvent) => {
    if (isKeyboardNavigationEvent(event)) {
      showFocusRing();
    }
  };

  const handlePointerInput = () => {
    hideFocusRing();
  };

  document.addEventListener("keydown", handleKeyboardInput);
  document.addEventListener("pointerdown", handlePointerInput, { passive: true });
  document.addEventListener("mousedown", handlePointerInput, { passive: true });
  document.addEventListener("touchstart", handlePointerInput, { passive: true });

  requestAnimationFrame(() => {
    showFocusRing();
    if (document.activeElement !== canvas) {
      canvas.focus({ preventScroll: true });
    }
  });

  canvas.addEventListener("focus", showFocusRing);

  return () => {
    document.removeEventListener("keydown", handleKeyboardInput);
    document.removeEventListener("pointerdown", handlePointerInput);
    document.removeEventListener("mousedown", handlePointerInput);
    document.removeEventListener("touchstart", handlePointerInput);
    canvas.removeEventListener("focus", showFocusRing);
  };
}
