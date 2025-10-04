import {
  getHudPreference,
  setHudPreference,
  subscribeToHudPreferences,
} from "../hud-store";
import {
  HUD_EVENT_AUDIO_TOGGLED,
  type HudAudioToggleDetail,
} from "../events";

export interface AudioToggleLabels {
  on: string;
  off: string;
}

export interface AudioToggleOptions {
  /** Target that receives HUD audio toggle events. Defaults to `document`. */
  eventTarget?: EventTarget;
  /**
   * Optional callback used to lazily create an {@link AudioContext} the first time audio is enabled.
   * When omitted, the component emits toggle events without an attached context.
   */
  audioContextFactory?: () => AudioContext;
  /** Override the accessible labels rendered by the control. */
  labels?: AudioToggleLabels;
}

export interface AudioToggleControl {
  readonly element: HTMLButtonElement;
  destroy(): void;
  setEnabled(enabled: boolean): void;
}

const DEFAULT_LABELS: AudioToggleLabels = {
  on: "Audio cues on",
  off: "Audio cues off",
};

function createEvent(detail: HudAudioToggleDetail): CustomEvent<HudAudioToggleDetail> {
  return new CustomEvent<HudAudioToggleDetail>(HUD_EVENT_AUDIO_TOGGLED, {
    detail,
  });
}

export function createAudioToggle(
  options: AudioToggleOptions = {},
): AudioToggleControl {
  const { eventTarget = document, labels = DEFAULT_LABELS } = options;

  const button = document.createElement("button");
  button.type = "button";
  button.classList.add("hud-audio-toggle");
  button.setAttribute("role", "switch");
  button.setAttribute("aria-live", "polite");

  let enabled = getHudPreference("audioEnabled");
  let audioContext: AudioContext | null = null;

  const ensureAudioContext = (): AudioContext | null => {
    if (!enabled) {
      return null;
    }

    if (!audioContext && options.audioContextFactory) {
      audioContext = options.audioContextFactory();
    }

    return audioContext;
  };

  const render = () => {
    const label = enabled ? labels.on : labels.off;
    button.textContent = label;
    button.setAttribute("aria-label", label);
    button.setAttribute("aria-checked", String(enabled));
    button.dataset.state = enabled ? "on" : "off";
  };

  const dispatch = () => {
    const detail: HudAudioToggleDetail = {
      enabled,
      audioContext: enabled ? ensureAudioContext() : null,
    };
    eventTarget.dispatchEvent(createEvent(detail));
  };

  const applyEnabled = (next: boolean) => {
    if (enabled === next) {
      return;
    }

    enabled = next;
    render();
    setHudPreference("audioEnabled", enabled);
    dispatch();
  };

  const handleClick = () => {
    applyEnabled(!enabled);
  };

  button.addEventListener("click", handleClick);

  const unsubscribe = subscribeToHudPreferences((preferences) => {
    if (preferences.audioEnabled === enabled) {
      return;
    }

    enabled = preferences.audioEnabled;
    render();
  });

  render();

  return {
    element: button,
    destroy() {
      button.removeEventListener("click", handleClick);
      unsubscribe();
    },
    setEnabled(next) {
      applyEnabled(next);
    },
  };
}

