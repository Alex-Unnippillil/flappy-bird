export type MedalId = "bronze" | "silver" | "gold" | "platinum";

export interface HudState {
  /**
   * Collection of medals earned by the player. The component accepts either an
   * array or a set for ergonomics when interfacing with immutable state
   * containers.
   */
  readonly earnedMedals?: ReadonlySet<MedalId> | readonly MedalId[];
}

export interface MedalDefinition {
  readonly id: MedalId;
  readonly label: string;
  readonly icon: string;
}

export const DEFAULT_MEDALS: readonly MedalDefinition[] = [
  { id: "bronze", label: "Bronze medal", icon: "🥉" },
  { id: "silver", label: "Silver medal", icon: "🥈" },
  { id: "gold", label: "Gold medal", icon: "🥇" },
  { id: "platinum", label: "Platinum trophy", icon: "🏆" },
];

export function toMedalSet(
  medals: HudState["earnedMedals"]
): ReadonlySet<MedalId> {
  if (!medals) {
    return new Set();
  }

  if (medals instanceof Set) {
    return medals;
  }

  return new Set(medals);
}
