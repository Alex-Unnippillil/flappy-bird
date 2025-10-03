const HUD_MESSAGES = {
  en: {
    'hud.hints.title': 'Flight academy',
    'hud.hints.tap': 'Tap, click, or press Space to flap your wings.',
    'hud.hints.restart': 'Press R or tap the Play button to restart after a crash.',
    'hud.hints.speed': 'Keep an eye on the speed meter—pipes move faster as you survive.',
    'hud.hints.focus': 'Stay centered between pipes to give yourself room for quick corrections.',
  },
  es: {
    'hud.hints.title': 'Academia de vuelo',
    'hud.hints.tap': 'Toca, haz clic o presiona la barra espaciadora para aletear.',
    'hud.hints.restart': 'Presiona R o toca el botón de Jugar para reiniciar después de un choque.',
    'hud.hints.speed': 'Mira el medidor de velocidad: los tubos se aceleran mientras sobrevives.',
    'hud.hints.focus': 'Mantén el ave centrada entre los tubos para reaccionar con más margen.',
  },
  fr: {
    'hud.hints.title': 'Académie du vol',
    'hud.hints.tap': 'Touchez, cliquez ou appuyez sur Espace pour battre des ailes.',
    'hud.hints.restart': 'Appuyez sur R ou sur le bouton Jouer pour recommencer après un crash.',
    'hud.hints.speed': 'Surveillez le compteur de vitesse : les tuyaux accélèrent au fil du temps.',
    'hud.hints.focus': 'Restez au centre entre les tuyaux pour garder une marge de manœuvre.',
  },
} as const;

export const HINT_KEYS = [
  'hud.hints.tap',
  'hud.hints.restart',
  'hud.hints.speed',
  'hud.hints.focus',
] as const;

export type HintKey = (typeof HINT_KEYS)[number];
export type HudLocale = keyof typeof HUD_MESSAGES;

const DEFAULT_LOCALE: HudLocale = 'en';

const SUPPORTED_LOCALES = Object.keys(HUD_MESSAGES) as HudLocale[];

export function resolveLocale(input?: string | null): HudLocale {
  if (!input) {
    return DEFAULT_LOCALE;
  }

  const normalized = input.toLowerCase();
  if (SUPPORTED_LOCALES.includes(normalized as HudLocale)) {
    return normalized as HudLocale;
  }

  const [languageCode] = normalized.split('-');
  if (SUPPORTED_LOCALES.includes(languageCode as HudLocale)) {
    return languageCode as HudLocale;
  }

  return DEFAULT_LOCALE;
}

export type HudMessageKey = HintKey | 'hud.hints.title';

export function translate(locale: string | undefined, key: HudMessageKey): string {
  const resolved = resolveLocale(locale);
  const messages = HUD_MESSAGES[resolved];
  const fallback = HUD_MESSAGES[DEFAULT_LOCALE];
  return messages[key] ?? fallback[key];
}

export interface LocalizedHints {
  title: string;
  hints: string[];
}

export function getLocalizedHints(locale?: string | null): LocalizedHints {
  return {
    title: translate(locale ?? undefined, 'hud.hints.title'),
    hints: HINT_KEYS.map((key) => translate(locale ?? undefined, key)),
  };
}

export function getAvailableLocales(): HudLocale[] {
  return [...SUPPORTED_LOCALES];
}
