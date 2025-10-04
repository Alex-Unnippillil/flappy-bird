export const HUD_INTRO = 'HUD_INTRO';
export const HUD_RUNNING = 'HUD_RUNNING';
export const HUD_GAME_OVER = 'HUD_GAME_OVER';

export type HudState =
  | typeof HUD_INTRO
  | typeof HUD_RUNNING
  | typeof HUD_GAME_OVER;
