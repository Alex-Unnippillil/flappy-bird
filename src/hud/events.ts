export const HUD_PAUSE = "hud:pause" as const;
export const HUD_GAME_OVER = "hud:game-over" as const;

export type HudPauseEventDetail = {
  paused: boolean;
  gameOver?: boolean;
  state?: string;
};

export type HudPauseEvent = CustomEvent<HudPauseEventDetail>;
