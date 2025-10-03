import { gameConfig, onMotionPreferenceChange } from "../config.ts";

export function initializeRenderer({ canvas } = {}) {
  if (typeof document === "undefined") {
    return () => {};
  }

  const root = document.documentElement;

  const applyMotionSettings = () => {
    root.style.setProperty("--motion-scale", String(gameConfig.motionScale));

    if (canvas) {
      canvas.dataset.motionScale = String(gameConfig.motionScale);
      canvas.dataset.motionPreference = gameConfig.nonEssentialAnimationsEnabled
        ? "standard"
        : "reduced";
    }
  };

  applyMotionSettings();

  const unsubscribe = onMotionPreferenceChange(() => {
    applyMotionSettings();
  });

  return () => {
    unsubscribe();

    if (canvas) {
      delete canvas.dataset.motionScale;
      delete canvas.dataset.motionPreference;
    }
  };
}
