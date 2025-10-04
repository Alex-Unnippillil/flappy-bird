import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

const scenes: any[] = [];
const cameras: any[] = [];
const renderers: any[] = [];
const colorArgs: unknown[] = [];

vi.mock("three", () => {
  class SceneMock {
    background: unknown = null;
    constructor() {
      scenes.push(this);
    }
  }

  class PerspectiveCameraMock {
    aspect: number;
    position = { set: vi.fn() };
    updateProjectionMatrix = vi.fn();
    constructor(public fov: number, aspect: number, public near: number, public far: number) {
      this.aspect = aspect;
      cameras.push(this);
    }
  }

  class WebGLRendererMock {
    domElement: HTMLCanvasElement;
    setPixelRatio = vi.fn();
    setSize = vi.fn();
    constructor(public params: unknown) {
      this.domElement = document.createElement("canvas");
      renderers.push(this);
    }
  }

  class ColorMock {
    value: unknown;
    constructor(value: unknown) {
      this.value = value;
      colorArgs.push(value);
    }
  }

  return {
    Scene: SceneMock,
    PerspectiveCamera: PerspectiveCameraMock,
    WebGLRenderer: WebGLRendererMock,
    Color: ColorMock,
  };
});

// eslint-disable-next-line import/first
import { createSceneContext } from "../scene";

describe("createSceneContext", () => {
  const originalPixelRatio = window.devicePixelRatio ?? 1;
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    container = document.getElementById("app") as HTMLElement;

    Object.defineProperty(container, "clientWidth", {
      configurable: true,
      value: 640,
    });
    Object.defineProperty(container, "clientHeight", {
      configurable: true,
      value: 480,
    });

    Object.defineProperty(window, "devicePixelRatio", {
      configurable: true,
      value: 1.5,
    });

    scenes.length = 0;
    cameras.length = 0;
    renderers.length = 0;
    colorArgs.length = 0;
  });

  afterEach(() => {
    Object.defineProperty(window, "devicePixelRatio", {
      configurable: true,
      value: originalPixelRatio,
    });
    vi.clearAllMocks();
  });

  it("creates the renderer, scene, and camera, and appends the canvas", () => {
    const context = createSceneContext();

    expect(context.scene).toBe(scenes[0]);
    expect(context.camera).toBe(cameras[0]);
    expect(context.renderer).toBe(renderers[0]);
    expect(renderers[0]?.params).toEqual({ antialias: true, alpha: true });
    expect(colorArgs).toContain("#87ceeb");
    expect(container.contains(context.renderer.domElement)).toBe(true);
    expect(context.renderer.domElement.style.position).toBe("absolute");
    expect(context.renderer.domElement.style.pointerEvents).toBe("none");
  });

  it("clamps the renderer pixel ratio", () => {
    Object.defineProperty(window, "devicePixelRatio", {
      configurable: true,
      value: 3,
    });

    const context = createSceneContext();
    const renderer = context.renderer as any;

    expect(renderer.setPixelRatio).toHaveBeenCalledWith(2);
  });

  it("updates size and camera aspect when the window resizes", () => {
    const context = createSceneContext();
    const renderer = context.renderer as any;

    expect(renderer.setSize).toHaveBeenCalledWith(640, 480, false);

    const newWidth = 900;
    const newHeight = 600;
    Object.defineProperty(container, "clientWidth", { configurable: true, value: newWidth });
    Object.defineProperty(container, "clientHeight", { configurable: true, value: newHeight });

    renderer.setSize.mockClear();
    (context.camera.updateProjectionMatrix as any).mockClear();

    window.dispatchEvent(new Event("resize"));

    expect(renderer.setSize).toHaveBeenCalledWith(newWidth, newHeight, false);
    expect(context.camera.aspect).toBeCloseTo(newWidth / newHeight);
    expect(context.camera.updateProjectionMatrix).toHaveBeenCalledTimes(1);
  });
});
