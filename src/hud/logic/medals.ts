export enum Medal {
  None = "none",
  Bronze = "bronze",
  Silver = "silver",
  Gold = "gold",
  Platinum = "platinum",
}

export const medalThresholds = Object.freeze({
  [Medal.Bronze]: 10,
  [Medal.Silver]: 20,
  [Medal.Gold]: 30,
  [Medal.Platinum]: 40,
});

export function getMedalForScore(score: number): Medal {
  if (!Number.isFinite(score)) {
    return Medal.None;
  }

  const normalizedScore = Math.floor(score);

  if (normalizedScore >= medalThresholds[Medal.Platinum]) {
    return Medal.Platinum;
  }

  if (normalizedScore >= medalThresholds[Medal.Gold]) {
    return Medal.Gold;
  }

  if (normalizedScore >= medalThresholds[Medal.Silver]) {
    return Medal.Silver;
  }

  if (normalizedScore >= medalThresholds[Medal.Bronze]) {
    return Medal.Bronze;
  }

  return Medal.None;
}
