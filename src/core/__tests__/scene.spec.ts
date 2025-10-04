import type { Mock } from "vitest";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type SceneModule = typeof import("../scene");
type MockFn<TArgs extends unknown[] = unknown[], TReturn = unknown> = Mock<TArgs, TReturn>;

interface SceneMockInstance {
  background: unknown;
}

interface PerspectiveCameraMockInstance {
  aspect: number;
  position: { set: MockFn<[number, number, number], void> };
  updateProjectionMatrix: MockFn<[], void>;
  fov: number;
  near: number;
  far: number;
}

interface WebGLRendererMockInstance {
  domElement: HTMLCanvasElement;
  params: unknown;
  setPixelRatio: MockFn<[number], void>;
  setSize: MockFn<[number, number, boolean], void>;
}

const scenes: SceneMockInstance[] = [];
const cameras: PerspectiveCameraMockInstance[] = [];
const renderers: WebGLRendererMockInstance[] = [];
const colorArgs: unknown[] = [];

vi.mock("three", () => {
  class SceneMock implements SceneMockInstance {
    background: unknown = null;
    constructor() {
      scenes.push(this);
    }
  }

  class PerspectiveCameraMock implements PerspectiveCameraMockInstance {
    aspect: number;
    position = { set: vi.fn<[number, number, number], void>() };
    updateProjectionMatrix = vi.fn<[], void>();
    constructor(public fov: number, aspect: number, public near: number, public far: number) {
      this.aspect = aspect;
      cameras.push(this);
    }
  }

  class WebGLRendererMock implements WebGLRendererMockInstance {
    domElement: HTMLCanvasElement;
    params: unknown;
    setPixelRatio = vi.fn<[number], void>();
    setSize = vi.fn<[number, number, boolean], void>();
    constructor(params: unknown) {
      this.params = params;
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

let createSceneContext: SceneModule["createSceneContext"];

beforeAll(async () => {
  ({ createSceneContext } = await import("../scene"));
});

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
    const renderer = context.renderer as unknown as WebGLRendererMockInstance;

    expect(renderer.setPixelRatio).toHaveBeenCalledWith(2);
  });

  it("updates size and camera aspect when the window resizes", () => {
    const context = createSceneContext();
    const renderer = context.renderer as unknown as WebGLRendererMockInstance;
    const camera = context.camera as unknown as PerspectiveCameraMockInstance;

    expect(renderer.setSize).toHaveBeenCalledWith(640, 480, false);

    const newWidth = 900;
    const newHeight = 600;
    Object.defineProperty(container, "clientWidth", { configurable: true, value: newWidth });
    Object.defineProperty(container, "clientHeight", { configurable: true, value: newHeight });

    renderer.setSize.mockClear();
    camera.updateProjectionMatrix.mockClear();

    window.dispatchEvent(new Event("resize"));

    expect(renderer.setSize).toHaveBeenCalledWith(newWidth, newHeight, false);
    expect(context.camera.aspect).toBeCloseTo(newWidth / newHeight);
    expect(camera.updateProjectionMatrix).toHaveBeenCalledTimes(1);
  });
});
