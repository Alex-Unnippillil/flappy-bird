export type VibrationPattern = number | number[];

type VibrateFunction = (pattern: VibrationPattern) => boolean;

export interface NavigatorLike {
  vibrate?: VibrateFunction;
}

export interface HapticsAdapter {
  /** Indicates whether the current environment exposes navigator.vibrate. */
  readonly supported: boolean;
  /**
   * Emits a short pulse to acknowledge a score increase. Longer patterns are
   * used for larger milestones (multiples of 10).
   */
  scoreMilestone(score: number): boolean;
  /**
   * Emits a celebratory vibration when a medal (or similar achievement) is
   * earned. The pattern scales with the provided tier identifier.
   */
  medalEarned(tier: string | null | undefined): boolean;
}

interface DetectionResult {
  supported: boolean;
  vibrate: VibrateFunction | null;
}

function normalizeTier(tier: string | null | undefined) {
  return typeof tier === "string" ? tier.trim().toLowerCase() : "";
}

export function detectVibrationSupport(
  maybeNavigator: NavigatorLike | undefined =
    typeof navigator !== "undefined"
      ? (navigator as unknown as NavigatorLike)
      : undefined
): DetectionResult {
  if (!maybeNavigator) {
    return { supported: false, vibrate: null };
  }

  const candidate = maybeNavigator.vibrate;

  if (typeof candidate !== "function") {
    return { supported: false, vibrate: null };
  }

  const bound: VibrateFunction = (pattern) => {
    try {
      const result = candidate.call(maybeNavigator, pattern);
      // Some browsers return false to signal unsupported patterns. Treat any
      // truthy value as success while still returning a boolean.
      return Boolean(result !== false);
    } catch (error) {
      console.warn("navigator.vibrate call failed", error);
      return false;
    }
  };

  return { supported: true, vibrate: bound };
}

function chooseScorePattern(score: number): VibrationPattern {
  if (!Number.isFinite(score)) {
    return 18;
  }

  if (score > 0 && score % 10 === 0) {
    return [28, 8, 28];
  }

  return 18;
}

const MEDAL_PATTERNS: Record<string, VibrationPattern> = {
  bronze: [20, 8, 24],
  silver: [24, 10, 24, 10, 30],
  gold: [30, 10, 30, 10, 40],
  platinum: [36, 12, 36, 12, 48],
};

const DEFAULT_MEDAL_PATTERN: VibrationPattern = [24, 8, 24, 8, 32];

export interface CreateHapticsOptions {
  navigator?: NavigatorLike;
}

export function createHapticsAdapter(
  options: CreateHapticsOptions = {}
): HapticsAdapter {
  const detection = detectVibrationSupport(options.navigator);

  const vibrate = detection.vibrate ?? (() => false);

  const run = (pattern: VibrationPattern) => vibrate(pattern);

  return {
    supported: detection.supported,
    scoreMilestone(score: number) {
      if (!detection.supported) return false;
      return run(chooseScorePattern(score));
    },
    medalEarned(tier: string | null | undefined) {
      if (!detection.supported) return false;
      const normalized = normalizeTier(tier);
      const pattern = MEDAL_PATTERNS[normalized] ?? DEFAULT_MEDAL_PATTERN;
      return run(pattern);
    },
  };
}
