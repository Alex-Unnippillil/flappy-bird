import { hudAdapter, type MedalEvent, type MedalListener, Medal } from "../adapter";
import { MEDAL_COPY } from "../medals";
import "../styles/medal-banner.css";

const MEDAL_CLASS_MAP: Record<Medal, string> = {
  [Medal.None]: "",
  [Medal.Bronze]: "medal-banner--bronze",
  [Medal.Silver]: "medal-banner--silver",
  [Medal.Gold]: "medal-banner--gold",
  [Medal.Platinum]: "medal-banner--platinum",
};

const MEDAL_SYMBOL_MAP: Record<Medal, string> = {
  [Medal.None]: "",
  [Medal.Bronze]: "🥉",
  [Medal.Silver]: "🥈",
  [Medal.Gold]: "🥇",
  [Medal.Platinum]: "🏆",
};

export interface MedalBannerOptions {
  mount?: Element | string | null;
  adapter?: { onMedal(listener: MedalListener): () => void };
  autoHideMs?: number | null;
}

const resolveMountHost = (target?: Element | string | null): HTMLElement => {
  if (typeof target === "string") {
    const resolved = document.querySelector<HTMLElement>(target);
    if (resolved) return resolved;
  } else if (target instanceof HTMLElement) {
    return target;
  }

  const host = document.createElement("div");
  document.body.appendChild(host);
  return host;
};

export class MedalBanner {
  #container: HTMLElement;
  #adapter: { onMedal(listener: MedalListener): () => void };
  #unsubscribe: (() => void) | null = null;
  #activeBanner: HTMLElement | null = null;
  #currentMedal: Medal = Medal.None;
  #autoHideMs: number | null;
  #hideTimer: number | null = null;

  constructor(options: MedalBannerOptions = {}) {
    this.#adapter = options.adapter ?? hudAdapter;
    this.#autoHideMs = options.autoHideMs ?? 5000;
    this.#container = this.#prepareContainer(resolveMountHost(options.mount));
    this.#subscribe();
  }

  destroy(): void {
    if (this.#unsubscribe) {
      this.#unsubscribe();
      this.#unsubscribe = null;
    }
    this.#clearHideTimer();
    if (this.#activeBanner) {
      this.#activeBanner.remove();
      this.#activeBanner = null;
    }
  }

  #prepareContainer(host: HTMLElement): HTMLElement {
    if (host.classList.contains("medal-banner-layer")) {
      host.setAttribute("aria-live", host.getAttribute("aria-live") ?? "polite");
      host.setAttribute("role", host.getAttribute("role") ?? "status");
      return host;
    }

    const container = document.createElement("div");
    container.classList.add("medal-banner-layer");
    container.setAttribute("aria-live", "polite");
    container.setAttribute("role", "status");
    host.appendChild(container);
    return container;
  }

  #subscribe(): void {
    this.#unsubscribe = this.#adapter.onMedal((event) => {
      this.#show(event);
    });
  }

  #ensureBannerElement(): HTMLElement {
    if (this.#activeBanner) {
      return this.#activeBanner;
    }

    const banner = document.createElement("article");
    banner.className = "medal-banner";
    banner.innerHTML = `
      <span class="medal-banner__emblem" aria-hidden="true"></span>
      <div class="medal-banner__copy">
        <strong class="medal-banner__title" data-medal-title></strong>
        <span class="medal-banner__description" data-medal-description></span>
      </div>
    `;

    this.#container.appendChild(banner);
    this.#activeBanner = banner;
    return banner;
  }

  #show(event: MedalEvent): void {
    const { medal } = event;

    if (!medal || medal === Medal.None) {
      this.#hide();
      return;
    }

    const banner = this.#ensureBannerElement();
    this.#updateBannerContent(banner, event);
    this.#activateBanner(banner, medal);

    const duration = event.persistent ? null : event.durationMs ?? this.#autoHideMs;
    if (duration !== null && Number.isFinite(duration)) {
      this.#scheduleHide(duration);
    } else {
      this.#clearHideTimer();
    }
  }

  #updateBannerContent(banner: HTMLElement, event: MedalEvent): void {
    const { medal, title, description } = event;
    const copy = MEDAL_COPY[medal];
    const titleEl = banner.querySelector<HTMLElement>('[data-medal-title]');
    const descriptionEl = banner.querySelector<HTMLElement>('[data-medal-description]');
    const emblemEl = banner.querySelector<HTMLElement>(".medal-banner__emblem");

    if (titleEl) {
      titleEl.textContent = title ?? copy?.title ?? "";
    }

    if (descriptionEl) {
      descriptionEl.textContent = description ?? copy?.description ?? "";
      descriptionEl.classList.toggle(
        "is-hidden",
        !(description ?? copy?.description)
      );
    }

    if (emblemEl) {
      emblemEl.textContent = MEDAL_SYMBOL_MAP[medal] ?? "";
    }
  }

  #activateBanner(banner: HTMLElement, medal: Medal): void {
    if (this.#currentMedal !== medal) {
      this.#swapMedalClasses(banner, medal);
      this.#currentMedal = medal;
    }

    banner.dataset.medal = medal;

    requestAnimationFrame(() => {
      banner.classList.add("is-active");
    });
  }

  #swapMedalClasses(banner: HTMLElement, medal: Medal): void {
    const className = MEDAL_CLASS_MAP[medal];

    for (const value of Object.values(MEDAL_CLASS_MAP)) {
      if (value) {
        banner.classList.remove(value);
      }
    }

    if (className) {
      banner.classList.add(className);
    }
  }

  #scheduleHide(duration: number): void {
    this.#clearHideTimer();
    this.#hideTimer = window.setTimeout(() => {
      this.#hide();
    }, Math.max(0, duration));
  }

  #clearHideTimer(): void {
    if (this.#hideTimer !== null) {
      window.clearTimeout(this.#hideTimer);
      this.#hideTimer = null;
    }
  }

  #hide(): void {
    this.#clearHideTimer();
    if (!this.#activeBanner) {
      this.#currentMedal = Medal.None;
      return;
    }

    const banner = this.#activeBanner;
    banner.classList.remove("is-active");
    const handleTransitionEnd = () => {
      banner.removeEventListener("transitionend", handleTransitionEnd);
      if (banner.isConnected) {
        banner.remove();
      }
    };

    banner.addEventListener("transitionend", handleTransitionEnd);
    window.setTimeout(handleTransitionEnd, 450);
    this.#activeBanner = null;
    this.#currentMedal = Medal.None;
  }
}
