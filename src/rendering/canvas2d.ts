export interface BirdLike {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PipeLike {
  x: number;
  width: number;
  topHeight: number;
  gapSize: number;
}

export interface RenderState {
  bird: BirdLike;
  pipes: readonly PipeLike[];
  score: number;
  gameOver: boolean;
  groundHeight: number;
  viewportWidth: number;
  viewportHeight: number;
}

export interface Canvas2dRendererOptions {
  backgroundColor?: string;
  pipeColor?: string;
  pipeHighlightColor?: string;
  birdColor?: string;
  groundColor?: string;
  groundAccentColor?: string;
  hudColor?: string;
  hudShadowColor?: string;
  fontFamily?: string;
}

export interface Canvas2dRenderer {
  resize(): void;
  render(state: RenderState): void;
  getViewportSize(): { width: number; height: number };
}

const DEFAULT_OPTIONS: Required<Canvas2dRendererOptions> = {
  backgroundColor: "#70c5ce",
  pipeColor: "#4ec04e",
  pipeHighlightColor: "#83d883",
  birdColor: "#ffdd00",
  groundColor: "#ded895",
  groundAccentColor: "#c4b980",
  hudColor: "#ffffff",
  hudShadowColor: "rgba(0, 0, 0, 0.4)",
  fontFamily: "\"Press Start 2P\", system-ui, sans-serif",
};

export function createCanvas2dRenderer(
  canvas: HTMLCanvasElement,
  options: Canvas2dRendererOptions = {}
): Canvas2dRenderer {
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to create 2D canvas renderer");
  }

  const ctx: CanvasRenderingContext2D = context;

  const settings = { ...DEFAULT_OPTIONS, ...options };

  let logicalWidth = canvas.clientWidth || canvas.width;
  let logicalHeight = canvas.clientHeight || canvas.height;
  let pixelRatio = window.devicePixelRatio ?? 1;

  function applyTransform(): void {
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function updateCanvasSize(): void {
    const cssWidth = canvas.clientWidth || canvas.width / (pixelRatio || 1);
    const cssHeight = canvas.clientHeight || canvas.height / (pixelRatio || 1);

    pixelRatio = window.devicePixelRatio ?? 1;

    logicalWidth = cssWidth;
    logicalHeight = cssHeight;

    const displayWidth = Math.max(1, Math.round(cssWidth * pixelRatio));
    const displayHeight = Math.max(1, Math.round(cssHeight * pixelRatio));

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    if (!canvas.style.width) {
      canvas.style.width = `${cssWidth}px`;
    }
    if (!canvas.style.height) {
      canvas.style.height = `${cssHeight}px`;
    }

    applyTransform();
  }

  updateCanvasSize();

  function clearFrame(): void {
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);
  }

  function drawBackground(): void {
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);
  }

  function drawPipes(pipes: readonly PipeLike[], viewportHeight: number): void {
    ctx.fillStyle = settings.pipeColor;

    for (const pipe of pipes) {
      const { x, width, topHeight, gapSize } = pipe;
      const bottomY = topHeight + gapSize;
      const bottomHeight = Math.max(0, viewportHeight - bottomY);

      ctx.fillStyle = settings.pipeColor;
      ctx.fillRect(x, 0, width, topHeight);
      ctx.fillRect(x, bottomY, width, bottomHeight);

      ctx.fillStyle = settings.pipeHighlightColor;
      ctx.fillRect(x, topHeight - 6, width, 6);
      ctx.fillRect(x, bottomY, width, 6);
    }
  }

  function drawBird(bird: BirdLike): void {
    ctx.fillStyle = settings.birdColor;
    ctx.beginPath();
    const radius = Math.max(bird.width, bird.height) / 2;
    ctx.ellipse(bird.x + bird.width / 2, bird.y + bird.height / 2, radius, radius * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawGround(groundHeight: number): void {
    const groundY = logicalHeight - groundHeight;
    ctx.fillStyle = settings.groundColor;
    ctx.fillRect(0, groundY, logicalWidth, groundHeight);
    ctx.fillStyle = settings.groundAccentColor;
    ctx.fillRect(0, groundY, logicalWidth, Math.max(4, Math.floor(groundHeight * 0.15)));
  }

  function drawHud(state: RenderState): void {
    ctx.fillStyle = settings.hudShadowColor;
    ctx.font = `600 20px ${settings.fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const scoreText = `Score: ${state.score}`;
    ctx.fillText(scoreText, 18, 18);

    ctx.fillStyle = settings.hudColor;
    ctx.fillText(scoreText, 16, 16);

    if (state.gameOver) {
      const overlayWidth = Math.min(logicalWidth - 40, 280);
      const overlayHeight = 120;
      const overlayX = (logicalWidth - overlayWidth) / 2;
      const overlayY = (logicalHeight - overlayHeight) / 2;

      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.fillRect(0, 0, logicalWidth, logicalHeight);

      ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
      ctx.fillRect(overlayX, overlayY, overlayWidth, overlayHeight);

      ctx.fillStyle = settings.hudColor;
      ctx.font = `700 24px ${settings.fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Game Over", logicalWidth / 2, overlayY + 36);

      ctx.font = `400 14px ${settings.fontFamily}`;
      ctx.fillText("Click to play again", logicalWidth / 2, overlayY + overlayHeight - 30);
    }
  }

  return {
    resize(): void {
      updateCanvasSize();
    },
    render(state: RenderState): void {
      const currentRatio = window.devicePixelRatio ?? 1;
      if (currentRatio !== pixelRatio) {
        updateCanvasSize();
      } else {
        applyTransform();
      }

      logicalWidth = state.viewportWidth;
      logicalHeight = state.viewportHeight;

      clearFrame();
      drawBackground();
      drawPipes(state.pipes, state.viewportHeight - state.groundHeight);
      drawBird(state.bird);
      drawGround(state.groundHeight);
      drawHud(state);
    },
    getViewportSize(): { width: number; height: number } {
      return { width: logicalWidth, height: logicalHeight };
    },
  };
}
