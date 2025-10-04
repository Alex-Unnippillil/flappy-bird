export const HUD_CHANNEL_SCORE_TICK = "hud:score-tick" as const;

export type HudChannel = typeof HUD_CHANNEL_SCORE_TICK;

export interface HudEventPayloads {
  [HUD_CHANNEL_SCORE_TICK]: {
    /**
     * The amount the score increased by for this tick.
     */
    increment: number;
    /**
     * The running total score after applying the increment.
     */
    total: number;
  };
}
