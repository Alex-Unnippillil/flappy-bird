/**
 * Format a numeric score for HUD display. The function clamps negative and
 * non-finite values to zero, floors fractional values, and pads the result
 * to three digits so the UI remains stable as the score grows.
 */
export function formatScore(score: number): string {
  if (!Number.isFinite(score) || score < 0) {
    score = 0;
  }

  const rounded = Math.floor(score);
  return rounded.toString().padStart(3, "0");
}
