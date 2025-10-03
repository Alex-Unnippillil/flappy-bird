const DEBUG_QUERY_PARAM = "debugOverlay";
const TOGGLE_KEY = "KeyD";

let debugOverlayEnabled = false;
let initialized = false;

type BirdRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type PipeRect = {
  x: number;
  width: number;
  topHeight: number;
  gapSize: number;
  canvasHeight: number;
};

type ContactPoint = {
  x: number;
  y: number;
};

function parseInitialState(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  const value = params.get(DEBUG_QUERY_PARAM);
  if (!value) {
    return false;
  }

  const normalized = value.toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "on";
}

function notifyToggle(): void {
  if (typeof console !== "undefined") {
    console.info(`Debug overlay ${debugOverlayEnabled ? "enabled" : "disabled"}.`);
  }
}

function toggleOverlay(): void {
  debugOverlayEnabled = !debugOverlayEnabled;
  notifyToggle();
}

export function initializeDebugOverlayControls(): void {
  if (initialized || typeof window === "undefined") {
    return;
  }

  initialized = true;
  debugOverlayEnabled = parseInitialState();

  if (debugOverlayEnabled) {
    notifyToggle();
  }

  window.addEventListener("keydown", (event) => {
    if (event.code === TOGGLE_KEY && !event.defaultPrevented) {
      toggleOverlay();
    }
  });
}

export function isDebugOverlayEnabled(): boolean {
  return debugOverlayEnabled;
}

export function drawDebugOverlay(
  ctx: CanvasRenderingContext2D,
  options: {
    bird: BirdRect;
    pipes: PipeRect[];
    contactPoints: ContactPoint[];
  }
): void {
  const { bird, pipes, contactPoints } = options;

  ctx.save();

  ctx.lineWidth = 2;
  ctx.setLineDash([4, 2]);

  // Bird bounding box
  ctx.strokeStyle = "rgba(255, 0, 0, 0.9)";
  ctx.strokeRect(bird.x, bird.y, bird.width, bird.height);

  // Pipe bounding boxes
  ctx.strokeStyle = "rgba(0, 128, 0, 0.9)";
  pipes.forEach((pipe) => {
    ctx.strokeRect(pipe.x, 0, pipe.width, pipe.topHeight);

    const bottomY = pipe.topHeight + pipe.gapSize;
    const bottomHeight = Math.max(0, pipe.canvasHeight - bottomY);
    ctx.strokeRect(pipe.x, bottomY, pipe.width, bottomHeight);
  });

  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(0, 102, 255, 0.9)";
  ctx.strokeStyle = "rgba(0, 102, 255, 0.9)";

  contactPoints.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}
