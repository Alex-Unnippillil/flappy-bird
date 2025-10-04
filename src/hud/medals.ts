export enum Medal {
  None = "none",
  Bronze = "bronze",
  Silver = "silver",
  Gold = "gold",
  Platinum = "platinum",
}

export const MEDAL_COPY: Record<Medal, { title: string; description: string } | null> = {
  [Medal.None]: null,
  [Medal.Bronze]: {
    title: "Bronze Medal",
    description: "A solid start! Keep flapping to climb the ranks.",
  },
  [Medal.Silver]: {
    title: "Silver Medal",
    description: "Great flying! You're edging closer to greatness.",
  },
  [Medal.Gold]: {
    title: "Gold Medal",
    description: "Amazing! Only elite birds soar this high.",
  },
  [Medal.Platinum]: {
    title: "Platinum Medal",
    description: "Legendary flight path unlocked. The skies salute you!",
  },
};
