export interface DesignResolution {
  width: number;
  height: number;
}

export interface CanvasLayout {
  scale: number;
  displayWidth: number;
  displayHeight: number;
  horizontalPadding: number;
  verticalPadding: number;
}

export interface LayoutOptions {
  viewportWidth: number;
  viewportHeight: number;
  designResolution: DesignResolution;
}

export interface ApplyLayoutOptions {
  propertyTarget?: HTMLElement | null;
}

function getDefaultPropertyTarget(): HTMLElement | null {
  if (typeof document === "undefined") {
    return null;
  }

  return document.body;
}

export function computeCanvasLayout({
  viewportWidth,
  viewportHeight,
  designResolution,
}: LayoutOptions): CanvasLayout {
  const { width: designWidth, height: designHeight } = designResolution;

  if (designWidth <= 0 || designHeight <= 0) {
    throw new Error("Design resolution must be a positive area");
  }

  const scale = Math.min(
    viewportWidth / designWidth,
    viewportHeight / designHeight
  );

  const displayWidth = Math.round(designWidth * scale);
  const displayHeight = Math.round(designHeight * scale);

  const horizontalPadding = Math.max(
    0,
    Math.floor((viewportWidth - displayWidth) / 2)
  );
  const verticalPadding = Math.max(
    0,
    Math.floor((viewportHeight - displayHeight) / 2)
  );

  return {
    scale,
    displayWidth,
    displayHeight,
    horizontalPadding,
    verticalPadding,
  };
}

export function applyCanvasLayout(
  canvas: HTMLCanvasElement,
  layout: CanvasLayout,
  designResolution: DesignResolution,
  options: ApplyLayoutOptions = {}
): void {
  const { displayWidth, displayHeight } = layout;
  const target = options.propertyTarget ?? getDefaultPropertyTarget();

  canvas.width = designResolution.width;
  canvas.height = designResolution.height;
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;

  if (target) {
    target.style.setProperty("--canvas-width", `${displayWidth}px`);
    target.style.setProperty("--canvas-height", `${displayHeight}px`);
    target.style.setProperty(
      "--letterbox-horizontal",
      `${layout.horizontalPadding}px`
    );
    target.style.setProperty(
      "--letterbox-vertical",
      `${layout.verticalPadding}px`
    );
  }
}
