export interface Canvas2DConfiguration {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  pixelRatio: number;
}

function getLogicalSize(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || canvas.width || Number(canvas.getAttribute("width")) || 0;
  const height = rect.height || canvas.height || Number(canvas.getAttribute("height")) || 0;

  return {
    width: Math.max(width, 0),
    height: Math.max(height, 0),
  };
}

export function configureCanvas2D(canvas: HTMLCanvasElement): Canvas2DConfiguration {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Unable to acquire 2D rendering context");
  }

  const pixelRatio = window.devicePixelRatio || 1;
  const { width, height } = getLogicalSize(canvas);

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const scaledWidth = Math.round(width * pixelRatio);
  const scaledHeight = Math.round(height * pixelRatio);

  if (canvas.width !== scaledWidth) {
    canvas.width = scaledWidth;
  }

  if (canvas.height !== scaledHeight) {
    canvas.height = scaledHeight;
  }

  if (typeof ctx.resetTransform === "function") {
    ctx.resetTransform();
  } else {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  ctx.scale(pixelRatio, pixelRatio);

  return {
    ctx,
    width,
    height,
    pixelRatio,
  };
}
