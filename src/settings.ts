// File Overview: This module belongs to src/settings.ts.
import Storage from './lib/storage';

export type TBindingSlot = 'primary' | 'secondary' | 'tertiary' | 'quaternary';

export interface IBindingEntry {
  slot: TBindingSlot;
  code: string;
  label: string;
}

export type TBindingsChangeCallback = (codes: string[]) => void;

export interface ISettingsInitResult {
  activeCodes: string[];
}

const STORAGE_KEY = 'control-key-bindings';
const ALWAYS_ALLOWED_CODES = ['NumpadEnter'];

const DEFAULT_BINDINGS: IBindingEntry[] = [
  { slot: 'primary', code: 'Space', label: 'Space' },
  { slot: 'secondary', code: 'Enter', label: 'Enter' },
  { slot: 'tertiary', code: 'ArrowUp', label: 'Arrow Up' },
  { slot: 'quaternary', code: 'KeyW', label: 'W' }
];

const isModifierKey = (evt: KeyboardEvent): boolean => {
  return (
    evt.key === 'Shift' ||
    evt.key === 'Meta' ||
    evt.key === 'Control' ||
    evt.key === 'Alt'
  );
};

const formatLabel = (code: string, key?: string): string => {
  if (key) {
    if (key === ' ') return 'Space';
    if (key.length === 1) return key.toUpperCase();
    if (key === 'ArrowUp') return 'Arrow Up';
    if (key === 'ArrowDown') return 'Arrow Down';
    if (key === 'ArrowLeft') return 'Arrow Left';
    if (key === 'ArrowRight') return 'Arrow Right';
    if (key === 'Escape') return 'Escape';
  }

  if (code.startsWith('Key') && code.length > 3) {
    return code.substring(3);
  }

  if (code.startsWith('Digit') && code.length > 5) {
    return code.substring(5);
  }

  switch (code) {
    case 'Space':
      return 'Space';
    case 'Enter':
      return 'Enter';
    case 'NumpadEnter':
      return 'Numpad Enter';
    case 'ArrowUp':
      return 'Arrow Up';
    case 'ArrowDown':
      return 'Arrow Down';
    case 'ArrowLeft':
      return 'Arrow Left';
    case 'ArrowRight':
      return 'Arrow Right';
    case 'Escape':
      return 'Escape';
    default:
      return code;
  }
};

const sanitizeBindings = (entries: IBindingEntry[]): IBindingEntry[] => {
  const bySlot = new Map<TBindingSlot, IBindingEntry>();

  for (const entry of entries) {
    if (!entry.slot) continue;
    if (!entry.code) continue;
    const normalizedSlot = entry.slot;
    if (!bySlot.has(normalizedSlot)) {
      bySlot.set(normalizedSlot, {
        slot: normalizedSlot,
        code: entry.code,
        label: entry.label || formatLabel(entry.code)
      });
    }
  }

  const result: IBindingEntry[] = [];
  for (const defaultEntry of DEFAULT_BINDINGS) {
    const storedEntry = bySlot.get(defaultEntry.slot);
    if (!storedEntry) {
      result.push({ ...defaultEntry });
      continue;
    }

    result.push({
      slot: defaultEntry.slot,
      code: storedEntry.code,
      label: storedEntry.label || formatLabel(storedEntry.code)
    });
  }

  return result;
};

const loadBindings = (): IBindingEntry[] => {
  const stored = Storage.get(STORAGE_KEY);
  if (typeof stored === 'string') {
    try {
      const parsed = JSON.parse(stored) as Partial<IBindingEntry>[];
      if (Array.isArray(parsed)) {
        return sanitizeBindings(
          parsed.filter((item): item is IBindingEntry => {
            return (
              typeof item.slot === 'string' &&
              typeof item.code === 'string' &&
              typeof item.label === 'string'
            );
          })
        );
      }
    } catch (err) {
      console.warn('Failed to parse stored key bindings', err);
    }
  }

  return DEFAULT_BINDINGS.map((entry) => ({ ...entry }));
};

const persistBindings = (entries: IBindingEntry[]) => {
  Storage.save(STORAGE_KEY, JSON.stringify(entries));
};

const collectActiveCodes = (entries: IBindingEntry[]): string[] => {
  return Array.from(
    new Set([...entries.map((entry) => entry.code), ...Array.from(ALWAYS_ALLOWED_CODES)])
  );
};

const updateInputs = (
  bindings: IBindingEntry[],
  inputs: NodeListOf<HTMLInputElement>
): void => {
  inputs.forEach((input) => {
    const slot = input.dataset.slot as TBindingSlot | undefined;
    if (!slot) return;
    const binding = bindings.find((entry) => entry.slot === slot);
    if (!binding) return;
    input.value = binding.label;
    input.dataset.code = binding.code;
    input.title = `${binding.label} (${binding.code})`;
  });
};

const showError = (element: HTMLElement | null, message?: string) => {
  if (!element) return;
  if (!message) {
    element.textContent = '';
    element.setAttribute('hidden', '');
    return;
  }

  element.textContent = message;
  element.removeAttribute('hidden');
};

const resetInputValue = (
  bindings: IBindingEntry[],
  input: HTMLInputElement | null
): void => {
  if (!input) return;
  const slot = input.dataset.slot as TBindingSlot | undefined;
  if (!slot) return;
  const binding = bindings.find((entry) => entry.slot === slot);
  if (!binding) return;
  input.value = binding.label;
};

const handleCapture = (
  evt: KeyboardEvent,
  slot: TBindingSlot,
  bindings: IBindingEntry[],
  inputs: NodeListOf<HTMLInputElement>,
  errorEl: HTMLElement | null,
  onChange: TBindingsChangeCallback
): void => {
  if (evt.key === 'Tab') return;

  if (evt.key === 'Escape') {
    evt.preventDefault();
    showError(errorEl);
    (document.activeElement as HTMLElement | null)?.blur();
    return;
  }

  evt.preventDefault();

  if (isModifierKey(evt)) {
    showError(errorEl, 'Modifier keys cannot be used.');
    return;
  }

  const code = evt.code;
  const label = formatLabel(code, evt.key);
  const existing = bindings.find((entry) => entry.code === code && entry.slot !== slot);
  if (existing) {
    showError(errorEl, `"${label}" is already assigned to another slot.`);
    updateInputs(bindings, inputs);
    return;
  }

  const current = bindings.find((entry) => entry.slot === slot);
  if (!current) return;

  current.code = code;
  current.label = label;

  persistBindings(bindings);
  updateInputs(bindings, inputs);
  showError(errorEl);
  onChange(collectActiveCodes(bindings));
};

const initControlSettings = (onChange: TBindingsChangeCallback): ISettingsInitResult => {
  new Storage();

  const container = document.querySelector<HTMLDivElement>('#control-settings');
  const toggleButton = container?.querySelector<HTMLButtonElement>(
    '#control-settings__toggle'
  );
  const form = container?.querySelector<HTMLFormElement>('#control-settings__form');
  const errorEl = container?.querySelector<HTMLElement>('#control-settings__error') ?? null;
  const inputs = form?.querySelectorAll<HTMLInputElement>('input[data-slot]') ?? null;

  let bindings = loadBindings();

  const activeCodes = collectActiveCodes(bindings);

  if (!container || !toggleButton || !form || !inputs) {
    return { activeCodes };
  }

  let activeSlot: TBindingSlot | null = null;

  updateInputs(bindings, inputs);

  toggleButton.addEventListener('click', () => {
    const isOpen = !container.classList.contains('is-open');
    container.classList.toggle('is-open', isOpen);
    toggleButton.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      showError(errorEl);
      window.setTimeout(() => {
        inputs[0]?.focus();
      }, 0);
    } else {
      activeSlot = null;
      showError(errorEl);
    }
  });

  form.addEventListener('focusin', (evt) => {
    const target = evt.target as HTMLInputElement | null;
    if (!target?.dataset.slot) return;
    activeSlot = target.dataset.slot as TBindingSlot;
    target.value = 'Press a key';
    showError(errorEl, '');
  });

  form.addEventListener('focusout', (evt) => {
    const target = evt.target as HTMLInputElement | null;
    if (!target?.dataset.slot) return;
    window.setTimeout(() => {
      resetInputValue(bindings, target);
    }, 0);
    if (activeSlot === target.dataset.slot) {
      activeSlot = null;
    }
  });

  form.addEventListener('keydown', (evt) => {
    if (!activeSlot) return;
    handleCapture(evt, activeSlot, bindings, inputs, errorEl, onChange);
  });

  return {
    activeCodes
  };
};

export default initControlSettings;
