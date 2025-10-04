export type HudLayerName = string;

export interface HudRootOptions {
  host?: HTMLElement | string | null;
  layers?: HudLayerName[];
}

function resolveHost(host?: HTMLElement | string | null): HTMLElement | null {
  if (!host) {
    return document.body;
  }

  if (typeof host === "string") {
    return document.querySelector(host);
  }

  return host;
}

/**
 * The HUD root manages DOM layering for overlays and modal components. It keeps
 * a small registry of layers and ensures components can be mounted into the
 * appropriate container without interfering with the rest of the layout.
 */
export class HudRoot {
  private readonly host: HTMLElement;

  private readonly root: HTMLDivElement;

  private readonly layers = new Map<HudLayerName, HTMLDivElement>();

  constructor(options: HudRootOptions = {}) {
    const host = resolveHost(options.host);
    if (!host) {
      throw new Error("Unable to initialize HUD root: host element was not found.");
    }

    this.host = host;
    this.root = document.createElement("div");
    this.root.className = "hud-root";
    this.host.appendChild(this.root);

    const initialLayers = options.layers ?? ["base", "modal"];
    initialLayers.forEach((layerName) => {
      this.ensureLayer(layerName);
    });
  }

  /** Returns the DOM element associated with the provided layer name. */
  getLayer(name: HudLayerName): HTMLDivElement {
    return this.ensureLayer(name);
  }

  /** Appends an element to the requested layer, creating it if needed. */
  mount(element: HTMLElement, layerName: HudLayerName = "base") {
    const layer = this.ensureLayer(layerName);
    if (element.parentElement !== layer) {
      layer.appendChild(element);
    }
  }

  /** Removes the root and any layers from the DOM. */
  destroy() {
    this.layers.clear();
    if (this.root.parentElement) {
      this.root.parentElement.removeChild(this.root);
    }
  }

  private ensureLayer(name: HudLayerName): HTMLDivElement {
    const existing = this.layers.get(name);
    if (existing) {
      return existing;
    }

    const layer = document.createElement("div");
    layer.className = `hud-layer hud-layer--${name}`;
    layer.dataset.hudLayer = name;
    this.layers.set(name, layer);
    this.root.appendChild(layer);
    return layer;
  }
}
