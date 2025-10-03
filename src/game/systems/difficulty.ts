export type DifficultyMetrics = {
  pipeSpeed: number;
  gapSize: number;
  spawnInterval: number;
};

export type DifficultyPoint = DifficultyMetrics & {
  /** Score threshold (inclusive) for the metrics to take effect. */
  score: number;
};

const SCORE_MILESTONES: DifficultyPoint[] = [
  { score: 0, pipeSpeed: 2, gapSize: 100, spawnInterval: 120 },
  { score: 20, pipeSpeed: 2.5, gapSize: 95, spawnInterval: 110 },
  { score: 50, pipeSpeed: 3.2, gapSize: 90, spawnInterval: 100 },
  { score: 100, pipeSpeed: 4, gapSize: 85, spawnInterval: 90 },
  { score: 200, pipeSpeed: 5, gapSize: 80, spawnInterval: 80 },
];

const TIME_BUCKET_SECONDS = 30;
const MAX_TIME_BUCKETS = 6; // caps adjustments at the 3 minute mark
const TIME_PIPE_SPEED_INCREMENT = 0.05;
const TIME_GAP_REDUCTION = 0.5;
const TIME_SPAWN_REDUCTION = 1;

const MIN_GAP_SIZE = 70;
const MIN_SPAWN_INTERVAL = 70;

/**
 * Score milestones used to tune the game's difficulty curve.
 *
 * | Score | Pipe Speed | Gap Size | Spawn Interval |
 * | ----- | ---------- | -------- | -------------- |
 * | 0     | 2.0        | 100      | 120            |
 * | 20    | 2.5        | 95       | 110            |
 * | 50    | 3.2        | 90       | 100            |
 * | 100   | 4.0        | 85       | 90             |
 * | 200   | 5.0        | 80       | 80             |
 */
export const difficultyMilestones: readonly DifficultyPoint[] = SCORE_MILESTONES;

function getMilestoneForScore(score: number): DifficultyPoint {
  let current = SCORE_MILESTONES[0];
  for (const milestone of SCORE_MILESTONES) {
    if (score >= milestone.score) {
      current = milestone;
    } else {
      break;
    }
  }
  return current;
}

function getTimeBucket(elapsedSeconds: number): number {
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) {
    return 0;
  }
  return Math.min(
    Math.floor(elapsedSeconds / TIME_BUCKET_SECONDS),
    MAX_TIME_BUCKETS,
  );
}

function applyTimeAdjustments(metrics: DifficultyMetrics, elapsedSeconds: number): DifficultyMetrics {
  const bucket = getTimeBucket(elapsedSeconds);
  if (bucket === 0) {
    return metrics;
  }

  const pipeSpeed = metrics.pipeSpeed + bucket * TIME_PIPE_SPEED_INCREMENT;
  const gapSize = Math.max(metrics.gapSize - bucket * TIME_GAP_REDUCTION, MIN_GAP_SIZE);
  const spawnInterval = Math.max(
    Math.round(metrics.spawnInterval - bucket * TIME_SPAWN_REDUCTION),
    MIN_SPAWN_INTERVAL,
  );

  return { pipeSpeed, gapSize, spawnInterval };
}

export function getDifficulty(score: number, elapsedSeconds: number): DifficultyMetrics {
  const { pipeSpeed, gapSize, spawnInterval } = getMilestoneForScore(
    Math.max(0, Math.floor(score)),
  );
  return applyTimeAdjustments({ pipeSpeed, gapSize, spawnInterval }, Math.max(0, elapsedSeconds));
}

export function getPipeSpeed(score: number, elapsedSeconds: number): number {
  return getDifficulty(score, elapsedSeconds).pipeSpeed;
}

export function getGapSize(score: number, elapsedSeconds: number): number {
  return getDifficulty(score, elapsedSeconds).gapSize;
}

export function getSpawnInterval(score: number, elapsedSeconds: number): number {
  return getDifficulty(score, elapsedSeconds).spawnInterval;
}
