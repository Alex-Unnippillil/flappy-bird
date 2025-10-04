const ENGLISH_DICTIONARY = {
  scoreLabel: 'Score',
  bestLabel: 'Best',
  tapToStart: 'Tap to start',
} as const;

export type HudStringKey = keyof typeof ENGLISH_DICTIONARY;

type HudDictionary = Record<HudStringKey, string>;

const FRENCH_DICTIONARY: HudDictionary = {
  scoreLabel: 'Score',
  bestLabel: 'Record',
  tapToStart: 'Touchez pour commencer',
};

const DICTIONARIES: Record<string, HudDictionary> = {
  en: ENGLISH_DICTIONARY,
  fr: FRENCH_DICTIONARY,
};

const DEFAULT_LOCALE = 'en';
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
