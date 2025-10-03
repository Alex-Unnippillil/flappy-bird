const WEBGL_CONTEXT_NAMES = ["webgl2", "webgl", "experimental-webgl"] as const;

export type WebGLSupportCheck = () => boolean;

/**
 * Determines whether the current environment supports WebGL rendering.
 */
export function isWebGLSupported(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  if (!window.WebGLRenderingContext && !(window as typeof window & { WebGL2RenderingContext?: unknown }).WebGL2RenderingContext) {
    return false;
  }

  try {
    const canvas = document.createElement("canvas");
    return WEBGL_CONTEXT_NAMES.some((contextId) => {
      try {
        const context = canvas.getContext(contextId, { failIfMajorPerformanceCaveat: true });
        return Boolean(context);
      } catch (error) {
        return false;
      }
    });
  } catch (error) {
    return false;
  }
}

/**
 * Provides a human readable reason explaining why WebGL is unavailable.
 */
export function getWebGLUnsupportedReason(): string {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return "WebGL is unavailable in this environment.";
  }

  if (!window.WebGLRenderingContext) {
    return "Your browser does not support WebGL.";
  }

  return "WebGL failed to initialize on this device.";
}
