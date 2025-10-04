import "../styles/dim-layer.css";

export interface DimLayerOptions {
  /**
   * Optional element to mount the dim layer into. When omitted, the overlay's
   * parent element will be used which keeps the layer aligned with the pause
   * affordance.
   */
  host?: HTMLElement | null;
  /**
   * Element whose border radius should be mirrored so the dim layer sits flush
   * with rounded corners.
   */
  radiusSource?: HTMLElement | null;
}

const VISIBLE_CLASS = "is-active";
const STATIC_CLASS = "dim-layer--static";

/**
 * DimLayer renders a soft, GPU-friendly blur behind the pause overlay so the
 * playfield recedes without incurring repeated expensive paint work.
 */
export class DimLayer {
  private readonly overlay: HTMLElement;
  private readonly host: HTMLElement;
  private readonly element: HTMLDivElement;
  private readonly radiusSource: HTMLElement;
  private readonly prefersReducedMotion: MediaQueryList;
  private resizeObserver: ResizeObserver | null = null;
  private rafHandle: number | null = null;
  private isActive = false;

  constructor(overlay: HTMLElement, options: DimLayerOptions = {}) {
    this.overlay = overlay;
    const host = options.host ?? overlay.parentElement;
    if (!host) {
      throw new Error("DimLayer requires the overlay to have a parent element.");
    }
    this.host = host;
    this.radiusSource = options.radiusSource ?? overlay;

    this.element = document.createElement("div");
    this.element.className = "dim-layer";
    this.element.setAttribute("aria-hidden", "true");

    const backdrop = document.createElement("div");
    backdrop.className = "dim-layer__backdrop";
    const frost = document.createElement("div");
    frost.className = "dim-layer__frost";
    const glow = document.createElement("div");
    glow.className = "dim-layer__glow";

    this.element.append(backdrop, frost, glow);

    this.host.insertBefore(this.element, this.overlay);

    this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.handleMotionPreference();
    if (typeof this.prefersReducedMotion.addEventListener === "function") {
      this.prefersReducedMotion.addEventListener("change", this.handleMotionPreference);
    } else if (typeof this.prefersReducedMotion.addListener === "function") {
      // Safari < 14 fallback.
      this.prefersReducedMotion.addListener(this.handleMotionPreference);
    }

    this.syncBorderRadius();
    this.installResizeObserver();
  }

  private readonly handleMotionPreference = () => {
    if (this.prefersReducedMotion.matches) {
      this.element.classList.add(STATIC_CLASS);
    } else {
      this.element.classList.remove(STATIC_CLASS);
    }
  };

  private installResizeObserver() {
    if (typeof ResizeObserver === "undefined") {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.syncBorderRadius();
    });
    this.resizeObserver.observe(this.radiusSource);
  }

  private syncBorderRadius() {
    const radius = getComputedStyle(this.radiusSource).borderRadius;
    if (radius) {
      this.element.style.borderRadius = radius;
    }
  }

  /**
   * Activates or hides the dim layer. The show transition runs in the next
   * animation frame so we can coalesce style changes with the overlay toggle.
   */
  setActive(shouldActivate: boolean) {
    if (this.isActive === shouldActivate) {
      return;
    }

    this.isActive = shouldActivate;

    if (shouldActivate) {
      // Ensure the dim layer sits underneath the overlay when it becomes
      // visible again after being detached or reordered.
      if (this.element.nextElementSibling !== this.overlay) {
        this.host.insertBefore(this.element, this.overlay);
      }

      if (this.rafHandle !== null) {
        cancelAnimationFrame(this.rafHandle);
      }
      this.rafHandle = requestAnimationFrame(() => {
        this.element.classList.add(VISIBLE_CLASS);
        this.rafHandle = null;
      });
    } else {
      if (this.rafHandle !== null) {
        cancelAnimationFrame(this.rafHandle);
        this.rafHandle = null;
      }
      this.element.classList.remove(VISIBLE_CLASS);
    }
  }

  dispose() {
    if (this.rafHandle !== null) {
      cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (typeof this.prefersReducedMotion.removeEventListener === "function") {
      this.prefersReducedMotion.removeEventListener("change", this.handleMotionPreference);
    } else if (typeof this.prefersReducedMotion.removeListener === "function") {
      this.prefersReducedMotion.removeListener(this.handleMotionPreference);
    }

    this.element.remove();
  }
}
