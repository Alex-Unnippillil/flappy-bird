const MAX_SAFE = Number.MAX_SAFE_INTEGER;

function sanitizeScore(raw: number): number {
  if (!Number.isFinite(raw)) {
    return 0;
  }

  if (raw <= 0) {
    return 0;
  }

  return Math.min(Math.floor(raw), MAX_SAFE);
}

export function formatScore(score: number): string {
  const safeScore = sanitizeScore(score);
  return safeScore.toLocaleString("en-US");
}
