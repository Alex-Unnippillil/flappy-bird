export const HUD_EVENT_AUDIO_TOGGLED = "hud:audio-toggled";

export interface HudAudioToggleDetail {
  enabled: boolean;
  audioContext: AudioContext | null;
}
