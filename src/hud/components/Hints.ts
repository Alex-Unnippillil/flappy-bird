import { getLocalizedHints } from '../hud-i18n';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

type MediaQueryListLike = Pick<MediaQueryList, 'matches'> & {
  addEventListener?: (type: 'change', listener: (event: MediaQueryListEvent) => void) => void;
  removeEventListener?: (type: 'change', listener: (event: MediaQueryListEvent) => void) => void;
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
};

export interface HintsOptions {
  locale?: string | null;
  document?: Document;
  matchMedia?: (query: string) => MediaQueryListLike;
  hintsEnabled?: boolean;
}

export interface HintsController {
  element: HTMLElement;
  setLocale: (locale: string | null) => void;
  setHintsEnabled: (enabled: boolean) => void;
  destroy: () => void;
}

function ensureDocument(doc?: Document): Document {
  if (doc) {
    return doc;
  }

  if (typeof document !== 'undefined') {
    return document;
  }

  throw new Error('Hints component requires a document to render into.');
}

function setupMediaQuery(
  matchMedia: ((query: string) => MediaQueryListLike) | undefined,
  onChange: (matches: boolean) => void,
): { list: MediaQueryListLike | null; teardown: () => void } {
  if (!matchMedia) {
    return { list: null, teardown: () => {} };
  }

  const list = matchMedia(REDUCED_MOTION_QUERY);
  const handler = (event: MediaQueryListEvent) => {
    onChange(event.matches);
  };

  if (list.addEventListener) {
    list.addEventListener('change', handler);
    return {
      list,
      teardown: () => {
        list.removeEventListener?.('change', handler);
      },
    };
  }

  if (list.addListener) {
    list.addListener(handler);
    return {
      list,
      teardown: () => {
        list.removeListener?.(handler);
      },
    };
  }

  return { list, teardown: () => {} };
}

export function createHints(options: HintsOptions = {}): HintsController {
  const doc = ensureDocument(options.document);
  const root = doc.createElement('section');
  root.className = 'hud-hints';
  root.setAttribute('role', 'note');

  const heading = doc.createElement('h2');
  heading.className = 'hud-hints__title';
  const list = doc.createElement('ul');
  list.className = 'hud-hints__list';

  root.append(heading, list);

  let currentLocale: string | null | undefined = options.locale ?? null;
  let hintsEnabled = options.hintsEnabled ?? true;
  let reducedMotion = false;

  const renderHints = () => {
    const { title, hints } = getLocalizedHints(currentLocale);
    heading.textContent = title;

    list.replaceChildren(
      ...hints.map((hint) => {
        const item = doc.createElement('li');
        item.className = 'hud-hints__item';
        item.textContent = hint;
        return item;
      }),
    );
  };

  const applyVisibility = () => {
    const shouldHide = reducedMotion || !hintsEnabled;
    root.hidden = shouldHide;
    root.setAttribute('aria-hidden', shouldHide ? 'true' : 'false');
  };

  const defaultMatchMedia =
    options.matchMedia ?? (doc.defaultView?.matchMedia?.bind(doc.defaultView) as
      | ((query: string) => MediaQueryListLike)
      | undefined);

  const { list: mediaQueryList, teardown } = setupMediaQuery(defaultMatchMedia, (matches) => {
    reducedMotion = matches;
    applyVisibility();
  });

  reducedMotion = Boolean(mediaQueryList?.matches);

  renderHints();
  applyVisibility();

  return {
    element: root,
    setLocale(locale: string | null) {
      currentLocale = locale;
      renderHints();
    },
    setHintsEnabled(enabled: boolean) {
      hintsEnabled = enabled;
      applyVisibility();
    },
    destroy() {
      teardown();
    },
  };
}

export default createHints;
