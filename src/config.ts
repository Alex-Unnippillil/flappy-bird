const MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";

type MotionChangeListener = (prefersReducedMotion: boolean) => void;

type GameConfig = {
  gravity: number;
  gapSize: number;
  pipeInterval: number;
  initialPipeSpeed: number;
  pipeSpeedIncrease: number;
  motionScale: number;
  nonEssentialAnimationsEnabled: boolean;
};

const baseGameConfig: GameConfig = {
  gravity: 0.6,
  gapSize: 100,
  pipeInterval: 120,
  initialPipeSpeed: 2,
  pipeSpeedIncrease: 0.5,
  motionScale: 1,
  nonEssentialAnimationsEnabled: true,
};

const reducedMotionOverrides: Partial<GameConfig> = {
  motionScale: 0.6,
  pipeSpeedIncrease: 0.3,
  nonEssentialAnimationsEnabled: false,
};

const motionListeners = new Set<MotionChangeListener>();

const isBrowserEnvironment =
  typeof window !== "undefined" && typeof window.matchMedia === "function";

const mediaQueryList = isBrowserEnvironment
  ? window.matchMedia(MOTION_MEDIA_QUERY)
  : null;

let prefersReducedMotion = mediaQueryList?.matches ?? false;

export const gameConfig: GameConfig = {
  ...baseGameConfig,
  ...(prefersReducedMotion ? reducedMotionOverrides : {}),
};

function applyDocumentMotionSettings() {
  if (!isBrowserEnvironment || !window.document?.documentElement) {
    return;
  }

  const { documentElement } = window.document;
  documentElement.classList.toggle("reduced-motion", prefersReducedMotion);
  documentElement.style.setProperty(
    "--motion-scale",
    String(gameConfig.motionScale)
  );
}

function notifyMotionListeners() {
  motionListeners.forEach((listener) => listener(prefersReducedMotion));
}

function refreshGameConfig() {
  const nextConfig: GameConfig = {
    ...baseGameConfig,
    ...(prefersReducedMotion ? reducedMotionOverrides : {}),
  };

  Object.assign(gameConfig, nextConfig);
  applyDocumentMotionSettings();
}

function updateMotionPreference(nextValue: boolean) {
  if (prefersReducedMotion === nextValue) {
    return;
  }

  prefersReducedMotion = nextValue;
  refreshGameConfig();
  notifyMotionListeners();
}

if (mediaQueryList) {
  const handleChange = (event: MediaQueryListEvent) => {
    updateMotionPreference(event.matches);
  };

  if (typeof mediaQueryList.addEventListener === "function") {
    mediaQueryList.addEventListener("change", handleChange);
  } else if (typeof mediaQueryList.addListener === "function") {
    mediaQueryList.addListener(handleChange);
  }
}

refreshGameConfig();

export function onMotionPreferenceChange(listener: MotionChangeListener) {
  motionListeners.add(listener);
  listener(prefersReducedMotion);
  return () => {
    motionListeners.delete(listener);
  };
}

export function getMotionPreference() {
  return prefersReducedMotion;
}

export const motionPreferences = {
  get prefersReducedMotion() {
    return prefersReducedMotion;
  },
};

