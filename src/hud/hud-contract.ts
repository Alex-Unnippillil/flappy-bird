/**
 * Describes the current, render-ready state for the heads-up display (HUD).
 * This structure is intentionally serializable so that UI layers can be rendered
 * in DOM, canvas, or WebGL contexts without referencing game internals.
 */
export interface HudState {
  /** The player's active score for the ongoing run. */
  currentScore: number;
  /** The highest score achieved by the player across all sessions. */
  bestScore: number;
  /**
   * The score from the most recently completed run. Undefined when the player
   * has not finished a session yet.
   */
  lastScore?: number;
  /** Indicates whether the game is currently over and awaiting restart input. */
  isGameOver: boolean;
  /** Whether the HUD should present a prompt instructing the player to start. */
  showStartPrompt: boolean;
  /**
   * A queue of recent score-related events that need to be animated by the HUD,
   * such as combo notifications or milestone popups.
   */
  scoreEvents: ScoreEvent[];
  /** The medal currently earned by the player for the active or last run. */
  medal: Medal;
  /** Optional human readable message for contextual guidance (e.g. "Paused"). */
  message?: string;
  /**
   * When applicable, the number of consecutive pipes cleared without failure
   * which can power combo-based HUD effects.
   */
  comboCount?: number;
  /**
   * Normalized progress (0-1) toward the next medal tier so progress bars can be
   * rendered without recomputing thresholds.
   */
  progressToNextMedal?: number;
  /** The currently active HUD theme, enabling runtime palette switches. */
  theme: HudTheme;
  /**
   * Countdown timer (in seconds) for pre-run start or power-up expiry UI. Null
   * when no countdown should be displayed.
   */
  countdownSeconds: number | null;
  /**
   * Optional snapshot of the top high scores to display in leaderboards or
   * summary dialogs.
   */
  highScores?: number[];
}

/**
 * Configuration describing how the HUD should present information regardless of
 * the current runtime state. This remains stable throughout a session and can
 * be used by layout engines to size and animate UI elements.
 */
export interface HudConfig {
  /** Enables or disables medal presentation entirely. */
  enableMedals: boolean;
  /** Whether to animate score increments or update them instantly. */
  animateScore: boolean;
  /** Preferred duration in milliseconds for transient score event popups. */
  scoreEventDurationMs: number;
  /**
   * Amount of time (ms) the start prompt should remain visible before fading if
   * the player is idle.
   */
  startPromptTimeoutMs: number;
  /**
   * Definition of score thresholds required to upgrade to each medal tier.
   * Values must be sorted in ascending order and aligned with the {@link Medal}
   * enum from lowest to highest prestige, excluding {@link Medal.None}.
   */
  medalThresholds: number[];
  /** Optional label to show for the score counter (e.g. "Score", "Distance"). */
  scoreLabel?: string;
  /** Optional label to show for the best score counter. */
  bestScoreLabel?: string;
}

/**
 * Discrete events emitted by game logic that the HUD can translate into visual
 * feedback such as floating text, icons, or audio cues.
 */
export interface ScoreEvent {
  /** High level category allowing the HUD to select distinct visual treatments. */
  type: ScoreEventType;
  /**
   * Score delta represented by the event. Positive values indicate rewards,
   * negative values represent penalties.
   */
  value: number;
  /** Optional text override for the popup when more context is required. */
  label?: string;
  /** Timestamp (ms since epoch or game start) for ordering animations. */
  timestamp: number;
}

/**
 * Supported categories of score events. Keeping this exported union allows
 * consuming HUDs to switch on specific event classes while remaining extensible.
 */
export type ScoreEventType =
  | "point"
  | "milestone"
  | "combo"
  | "power-up"
  | "penalty";

/**
 * Represents the medal prestige tiers obtainable by the player. The ordering is
 * defined from lowest to highest value.
 */
export enum Medal {
  /** Default state when no medal has been earned. */
  None = "none",
  /** Entry-level recognition for modest performance. */
  Bronze = "bronze",
  /** Intermediate medal for above-average runs. */
  Silver = "silver",
  /** High achievement medal reserved for expert performance. */
  Gold = "gold",
  /** Ultra-rare medal reserved for near-perfect mastery. */
  Platinum = "platinum",
}

/**
 * Theme values that control the look-and-feel of the HUD independently from the
 * game logic. Colors use CSS-compatible strings to support canvas and DOM.
 */
export interface HudTheme {
  /** Primary font family used across score labels and prompts. */
  fontFamily: string;
  /** Font color for primary score text. */
  scoreColor: string;
  /** Background color or gradient for HUD panels. */
  panelBackground: string;
  /** Color used for medals or highlight accents. */
  accentColor: string;
  /** Color for negative or warning feedback such as penalties. */
  warningColor: string;
  /** Optional drop shadow or outline style string for readability. */
  textShadow?: string;
  /** Optional sprite or texture identifier for HUD backgrounds. */
  backgroundTextureId?: string;
}
