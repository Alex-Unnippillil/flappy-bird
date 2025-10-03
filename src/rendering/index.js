import { createThreeRenderer } from "./three/index.ts";

let rendererInstance = null;

export function initializeRenderer(container) {
  if (!container) {
    throw new Error("Renderer initialization requires a valid container element.");
  }

  if (rendererInstance) {
    return rendererInstance;
  }

  rendererInstance = createThreeRenderer(container);
  return rendererInstance;
}
