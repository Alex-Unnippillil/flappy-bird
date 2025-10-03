import { initializeThreeRenderer } from "./rendering";

function bootstrap() {
  const canvas = document.getElementById("gameCanvas");

  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("Expected a <canvas id=\"gameCanvas\"> element in the document.");
  }

  const app = initializeThreeRenderer(canvas);

  if (import.meta.env.DEV) {
    // Expose for debugging during development builds.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).threeApp = app;
  }

  return app;
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", bootstrap, { once: true });
} else {
  bootstrap();
}
