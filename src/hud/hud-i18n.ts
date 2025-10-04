const DEFAULT_LOCALE = 'en' as const;

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

const DEFAULT_HINT_LOCALE: HudLocale = DEFAULT_LOCALE;

const SUPPORTED_LOCALES = Object.keys(HUD_MESSAGES) as HudLocale[];

export function resolveLocale(input?: string | null): HudLocale {
  if (!input) {
    return DEFAULT_HINT_LOCALE;
  }

  const normalized = input.toLowerCase();
  if (SUPPORTED_LOCALES.includes(normalized as HudLocale)) {
    return normalized as HudLocale;
  }

  const [languageCode] = normalized.split('-');
  if (SUPPORTED_LOCALES.includes(languageCode as HudLocale)) {
    return languageCode as HudLocale;
  }

  return DEFAULT_HINT_LOCALE;
}

export type HudMessageKey = HintKey | 'hud.hints.title';

export function translate(locale: string | undefined, key: HudMessageKey): string {
  const resolved = resolveLocale(locale);
  const messages = HUD_MESSAGES[resolved];
  const fallback = HUD_MESSAGES[DEFAULT_HINT_LOCALE];
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
const ENGLISH_DICTIONARY = {
  scoreLabel: 'Score',
  bestLabel: 'Best',
  tapToStart: 'Tap to start',
} as const;

export type HudStringKey = keyof typeof ENGLISH_DICTIONARY;

type HudDictionary = Record<HudStringKey, string>;

const SPANISH_DICTIONARY: HudDictionary = {
  scoreLabel: 'Puntuación',
  bestLabel: 'Mejor',
  tapToStart: 'Toca para comenzar',
};

const FRENCH_DICTIONARY: HudDictionary = {
  scoreLabel: 'Score',
  bestLabel: 'Record',
  tapToStart: 'Touchez pour commencer',
};

const DICTIONARIES: Record<HudLocale, HudDictionary> = {
  en: ENGLISH_DICTIONARY,
  es: SPANISH_DICTIONARY,
  fr: FRENCH_DICTIONARY,
};

const LOCALE_SEPARATOR_REGEX = /[-_]/;

const normalizeLocale = (locale?: string): string => {
  if (!locale) {
    return DEFAULT_LOCALE;
  }

  const primarySubtag = locale.toLowerCase().split(LOCALE_SEPARATOR_REGEX)[0];

  return primarySubtag || DEFAULT_LOCALE;
};

const getHudDictionary = (locale?: string): HudDictionary => {
  const normalizedLocale = normalizeLocale(locale);

  return DICTIONARIES[normalizedLocale] ?? ENGLISH_DICTIONARY;
};

export const getHudString = (key: HudStringKey, locale?: string): string =>
  getHudDictionary(locale)[key];
