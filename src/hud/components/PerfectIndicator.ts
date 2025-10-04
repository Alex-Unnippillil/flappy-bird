const FRAME_DURATION_MS = 1000 / 24;

export type ScoreIncrementDetail = {
  value: number;
  previous: number;
  delta: number;
};

export interface PerfectIndicatorAdapter {
  on(
    type: "score:increment",
    handler: (event: CustomEvent<ScoreIncrementDetail>) => void
  ): (() => void) | void;
  off?(
    type: "score:increment",
    handler: (event: CustomEvent<ScoreIncrementDetail>) => void
  ): void;
}

type IndicatorState = "idle" | "display" | "cooldown";

type PerfectTrigger = {
  score: number;
  delta: number;
};

type TimeoutHandle = ReturnType<typeof setTimeout> | null;

type MotionQuery = Pick<MediaQueryList, "matches"> & {
  addEventListener?: MediaQueryList["addEventListener"];
  removeEventListener?: MediaQueryList["removeEventListener"];
  addListener?: MediaQueryList["addListener"];
  removeListener?: MediaQueryList["removeListener"];
};

export interface PerfectIndicatorOptions {
  root?: Element | string | null;
  adapter?: PerfectIndicatorAdapter;
  cooldownMs?: number;
  showDurationMs?: number;
  queueLimit?: number;
  srMessage?: string;
}

interface ResolvedOptions {
  cooldownMs: number;
  showDurationMs: number;
  queueLimit: number;
  srMessage: string;
}

const DEFAULT_OPTIONS: ResolvedOptions = {
  cooldownMs: 320,
  showDurationMs: 680,
  queueLimit: 4,
  srMessage: "Perfect timing!",
};

function resolveElement<T extends Element>(input: Element | string | null | undefined): T | null {
  if (!input) {
    return null;
  }

  if (typeof input === "string") {
    return document.querySelector<T>(input);
  }

  return (input as T) ?? null;
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function nextFrame(callback: FrameRequestCallback): void {
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(callback);
    return;
  }

  setTimeout(() => {
    const now =
      typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now();
    callback(now);
  }, FRAME_DURATION_MS);
}

export class PerfectIndicator {
  private readonly root: HTMLElement | null;

  private readonly options: ResolvedOptions;

  private state: IndicatorState = "idle";

  private queue: PerfectTrigger[] = [];

  private activeBadge: HTMLElement | null = null;

  private displayTimeout: TimeoutHandle = null;

  private cooldownTimeout: TimeoutHandle = null;

  private liveRegionReset: TimeoutHandle = null;

  private prefersReducedMotion = false;

  private motionQuery: MotionQuery | null = null;

  private readonly liveRegion: HTMLElement | null;

  private detachAdapterListener: (() => void) | null = null;

  constructor(options: PerfectIndicatorOptions = {}) {
    const { root, adapter, ...optionOverrides } = options;
    this.root = resolveElement<HTMLElement>(root ?? null);
    this.options = {
      ...DEFAULT_OPTIONS,
      ...optionOverrides,
    } as ResolvedOptions;

    this.prefersReducedMotion = this.queryMotionPreference();
    this.liveRegion = this.ensureLiveRegion();
    this.applyBaseAttributes();
    this.subscribeToMotionPreference();

    if (adapter) {
      this.attachAdapter(adapter);
    }
  }

  destroy(): void {
    this.clearTimers();
    this.detachAdapterListener?.();
    this.detachAdapterListener = null;
    this.teardownMotionPreference();
    this.state = "idle";
    if (this.activeBadge) {
      this.activeBadge.remove();
      this.activeBadge = null;
    }
    this.queue = [];
    if (this.liveRegion) {
      this.liveRegion.textContent = "";
    }
  }

  trigger(score: number, delta = 1): void {
    if (!this.root) {
      return;
    }

    this.enqueue({ score, delta });
    this.processQueue();
  }

  private attachAdapter(adapter: PerfectIndicatorAdapter): void {
    const handler = (event: CustomEvent<ScoreIncrementDetail>) => {
      const detail = event?.detail;
      if (!detail) {
        return;
      }

      const score = toNumber(detail.value, 0);
      const delta = Math.max(1, Math.round(toNumber(detail.delta, 1)));
      this.enqueue({ score, delta });
      this.processQueue();
    };

    const disposer = adapter.on("score:increment", handler);
    if (typeof disposer === "function") {
      this.detachAdapterListener = disposer;
    } else if (adapter.off) {
      this.detachAdapterListener = () => adapter.off?.("score:increment", handler);
    }
  }

  private enqueue(trigger: PerfectTrigger): void {
    const limit = Math.max(1, this.options.queueLimit);
    this.queue.push(trigger);
    if (this.queue.length > limit) {
      this.queue.splice(0, this.queue.length - limit);
    }
  }

  private processQueue(): void {
    if (!this.root) {
      this.queue = [];
      return;
    }

    if (this.state !== "idle") {
      return;
    }

    const next = this.queue.shift();
    if (!next) {
      return;
    }

    this.present(next);
  }

  private present(trigger: PerfectTrigger): void {
    if (!this.root) {
      return;
    }

    this.state = "display";
    const badge = this.createBadge(trigger.delta);
    this.activeBadge = badge;
    this.root.appendChild(badge);

    nextFrame(() => {
      badge.classList.add("perfect-indicator__badge--active");
    });

    this.announce(trigger.score);

    const duration = this.getDisplayDuration();
    this.displayTimeout = setTimeout(() => {
      this.displayTimeout = null;
      badge.remove();
      this.activeBadge = null;
      this.enterCooldown();
    }, duration);
  }

  private enterCooldown(): void {
    this.state = "cooldown";
    const cooldownDuration = this.getCooldownDuration();
    if (cooldownDuration <= 0) {
      this.state = "idle";
      this.processQueue();
      return;
    }

    this.cooldownTimeout = setTimeout(() => {
      this.cooldownTimeout = null;
      this.state = "idle";
      this.processQueue();
    }, cooldownDuration);
  }

  private getDisplayDuration(): number {
    const raw = Math.max(0, this.options.showDurationMs);
    if (!this.prefersReducedMotion) {
      return raw;
    }
    return Math.min(240, Math.max(120, Math.round(raw / 2)));
  }

  private getCooldownDuration(): number {
    const raw = Math.max(0, this.options.cooldownMs);
    if (!this.prefersReducedMotion) {
      return raw;
    }
    return Math.min(180, Math.round(raw / 2));
  }

  private createBadge(delta: number): HTMLElement {
    const badge = document.createElement("span");
    badge.className = "perfect-indicator__badge";
    badge.setAttribute("aria-hidden", "true");

    const count = Math.max(1, Math.round(delta));
    badge.textContent = count > 1 ? `×${count}` : "✓";

    return badge;
  }

  private announce(score: number): void {
    if (!this.liveRegion) {
      return;
    }

    this.liveRegion.textContent = `${this.options.srMessage} Score: ${score}`;
    if (this.liveRegionReset) {
      clearTimeout(this.liveRegionReset);
    }
    this.liveRegionReset = setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = "";
      }
      this.liveRegionReset = null;
    }, Math.max(800, this.getDisplayDuration()));
  }

  private ensureLiveRegion(): HTMLElement | null {
    if (!this.root) {
      return null;
    }

    const existing = this.root.querySelector<HTMLElement>('[data-perfect-indicator="sr"]');
    if (existing) {
      existing.classList.add("perfect-indicator__sr");
      return existing;
    }

    const sr = document.createElement("span");
    sr.dataset.perfectIndicator = "sr";
    sr.className = "perfect-indicator__sr";
    sr.textContent = "";
    this.root.appendChild(sr);
    return sr;
  }

  private applyBaseAttributes(): void {
    if (!this.root) {
      return;
    }

    this.root.classList.add("perfect-indicator");
    if (!this.root.hasAttribute("role")) {
      this.root.setAttribute("role", "status");
    }
    if (!this.root.hasAttribute("aria-live")) {
      this.root.setAttribute("aria-live", "polite");
    }
    if (!this.root.hasAttribute("aria-atomic")) {
      this.root.setAttribute("aria-atomic", "true");
    }
  }

  private clearTimers(): void {
    if (this.displayTimeout) {
      clearTimeout(this.displayTimeout);
      this.displayTimeout = null;
    }
    if (this.cooldownTimeout) {
      clearTimeout(this.cooldownTimeout);
      this.cooldownTimeout = null;
    }
    if (this.liveRegionReset) {
      clearTimeout(this.liveRegionReset);
      this.liveRegionReset = null;
    }
  }

  private queryMotionPreference(): boolean {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }

    const query = window.matchMedia("(prefers-reduced-motion: reduce)") as MotionQuery;
    this.motionQuery = query;
    return query.matches;
  }

  private subscribeToMotionPreference(): void {
    if (!this.motionQuery) {
      return;
    }

    const listener = (event: MediaQueryListEvent) => {
      this.prefersReducedMotion = event.matches;
    };

    if (typeof this.motionQuery.addEventListener === "function") {
      this.motionQuery.addEventListener("change", listener);
      this.detachMotionListener = () => {
        this.motionQuery?.removeEventListener?.("change", listener);
      };
    } else if (typeof this.motionQuery.addListener === "function") {
      this.motionQuery.addListener(listener);
      this.detachMotionListener = () => {
        this.motionQuery?.removeListener?.(listener);
      };
    }
  }

  private detachMotionListener: (() => void) | null = null;

  private teardownMotionPreference(): void {
    this.detachMotionListener?.();
    this.detachMotionListener = null;
  }
}
