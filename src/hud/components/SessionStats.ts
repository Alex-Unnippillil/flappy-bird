import "../styles/session-stats.css";

export const HUD_GAME_OVER = "HUD_GAME_OVER" as const;

export interface SessionStatsDetail {
  attempts: number;
  averageScore: number;
  averageDurationMs: number;
  lastScore: number;
  lastDurationMs: number;
  sessionBest: number;
  bestScore: number;
}

interface SessionStatsOptions {
  root?: HTMLElement | string | null;
  toggleLabel?: string;
  expandedLabel?: string;
}

type StatKey =
  | "attempts"
  | "averageScore"
  | "sessionBest"
  | "lastScore"
  | "averageDurationMs"
  | "lastDurationMs"
  | "bestScore";

const STAT_CONFIG: Array<{
  key: StatKey;
  label: string;
  format(detail: SessionStatsDetail): string;
}> = [
  {
    key: "attempts",
    label: "Attempts",
    format: (detail) => formatCount(detail.attempts, "play"),
  },
  {
    key: "averageScore",
    label: "Average score",
    format: (detail) => formatNumber(detail.averageScore),
  },
  {
    key: "sessionBest",
    label: "Session best",
    format: (detail) => formatNumber(detail.sessionBest),
  },
  {
    key: "lastScore",
    label: "Last score",
    format: (detail) => formatNumber(detail.lastScore),
  },
  {
    key: "averageDurationMs",
    label: "Avg survival",
    format: (detail) => formatDuration(detail.averageDurationMs),
  },
  {
    key: "lastDurationMs",
    label: "Last survival",
    format: (detail) => formatDuration(detail.lastDurationMs),
  },
  {
    key: "bestScore",
    label: "All-time best",
    format: (detail) => formatNumber(detail.bestScore),
  },
];

function formatNumber(value: number): string {
  if (!Number.isFinite(value) || Number.isNaN(value)) {
    return "—";
  }
  const formatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: value % 1 === 0 ? 0 : 1,
  });
  return formatter.format(value);
}

function formatCount(count: number, noun: string): string {
  if (!Number.isFinite(count) || count <= 0) {
    return `No ${noun}s yet`;
  }
  const formatter = new Intl.NumberFormat();
  const label = count === 1 ? noun : `${noun}s`;
  return `${formatter.format(count)} ${label}`;
}

function formatDuration(milliseconds: number): string {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
    return "—";
  }
  const seconds = milliseconds / 1000;
  if (seconds < 10) {
    return `${seconds.toFixed(1)}s`;
  }
  if (seconds < 120) {
    return `${Math.round(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${remaining} min`;
}

function resolveRoot(root?: HTMLElement | string | null): HTMLElement | null {
  if (!root) {
    return document.querySelector<HTMLElement>("#sessionStats");
  }
  if (typeof root === "string") {
    return document.querySelector<HTMLElement>(root);
  }
  return root;
}

export class SessionStatsPanel {
  private readonly root: HTMLElement | null;

  private readonly toggle: HTMLButtonElement;

  private readonly panel: HTMLDivElement;

  private readonly list: HTMLDListElement;

  private expanded = false;

  private hasData = false;

  constructor(options: SessionStatsOptions = {}) {
    this.root = resolveRoot(options.root ?? null);
    this.toggle = document.createElement("button");
    this.panel = document.createElement("div");
    this.list = document.createElement("dl");

    if (!this.root) {
      return;
    }

    const toggleLabel = options.toggleLabel ?? "Show session stats";
    const expandedLabel = options.expandedLabel ?? "Hide session stats";
    const panelId = `${this.root.id || "session-stats"}-panel`;

    this.root.classList.add("session-stats");
    this.root.setAttribute("data-state", "idle");
    this.root.hidden = true;

    this.toggle.className = "session-stats__toggle";
    this.toggle.type = "button";
    this.toggle.textContent = toggleLabel;
    this.toggle.setAttribute("aria-expanded", "false");
    this.toggle.setAttribute("aria-controls", panelId);
    this.toggle.disabled = true;

    this.panel.className = "session-stats__panel";
    this.panel.id = panelId;
    this.panel.hidden = true;
    this.panel.setAttribute("role", "group");
    this.panel.setAttribute("tabindex", "-1");

    const heading = document.createElement("h2");
    heading.className = "session-stats__title";
    heading.textContent = "Session stats";

    this.list.className = "session-stats__list";

    this.panel.append(heading, this.list);
    this.root.append(this.toggle, this.panel);

    const updateToggleLabel = () => {
      this.toggle.textContent = this.expanded ? expandedLabel : toggleLabel;
    };

    const collapsePanel = () => {
      this.expanded = false;
      this.panel.hidden = true;
      this.toggle.setAttribute("aria-expanded", "false");
      this.root?.setAttribute("data-state", this.hasData ? "ready" : "idle");
      updateToggleLabel();
    };

    const expandPanel = (shouldFocus = true) => {
      if (!this.hasData) return;
      this.expanded = true;
      this.panel.hidden = false;
      this.toggle.setAttribute("aria-expanded", "true");
      this.root?.setAttribute("data-state", "open");
      updateToggleLabel();
      if (shouldFocus) {
        requestAnimationFrame(() => this.panel.focus());
      }
    };

    const togglePanel = () => {
      if (this.expanded) {
        collapsePanel();
        requestAnimationFrame(() => this.toggle.focus());
      } else {
        expandPanel();
      }
    };

    this.toggle.addEventListener("click", togglePanel);
    this.toggle.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" && !this.expanded) {
        event.preventDefault();
        expandPanel();
      }
    });

    this.panel.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        collapsePanel();
        requestAnimationFrame(() => this.toggle.focus());
      }
    });

    window.addEventListener(HUD_GAME_OVER, (event: Event) => {
      const customEvent = event as CustomEvent<SessionStatsDetail>;
      const firstUpdate = !this.hasData;
      this.applyStats(customEvent.detail);
      if (firstUpdate && !this.expanded) {
        expandPanel(false);
      }
    });

    this.updateToggleLabel = updateToggleLabel;
  }

  private updateToggleLabel: () => void = () => {};

  applyStats(detail?: SessionStatsDetail) {
    if (!this.root || !detail) return;

    if (!this.hasData) {
      this.root.hidden = false;
      this.toggle.disabled = false;
      this.hasData = true;
      this.root.setAttribute("data-state", "ready");
      this.updateToggleLabel();
    }

    this.list.textContent = "";

    for (const stat of STAT_CONFIG) {
      const wrapper = document.createElement("div");
      wrapper.className = "session-stats__item";
      wrapper.dataset.stat = stat.key;

      const term = document.createElement("dt");
      term.className = "session-stats__label";
      term.textContent = stat.label;

      const description = document.createElement("dd");
      description.className = "session-stats__value";
      description.textContent = stat.format(detail);

      wrapper.append(term, description);
      this.list.append(wrapper);
    }

    this.root.dispatchEvent(
      new CustomEvent("sessionstatsupdate", {
        bubbles: true,
        detail,
      })
    );

    if (this.expanded) {
      requestAnimationFrame(() => this.panel.focus());
    }
  }
}

export function initSessionStats(options?: SessionStatsOptions): SessionStatsPanel {
  return new SessionStatsPanel(options);
}

export default SessionStatsPanel;
