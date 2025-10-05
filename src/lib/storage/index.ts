// File Overview: This module belongs to src/lib/storage/index.ts.
export type IStoreValue = string | number | boolean;
export interface IData {
  type: IStoreValue;
  value: string;
}

export default class Storage {
  private static sk: string | null = null;
  private static isAvailable = false;
  private static fallbackStore = new Map<string, IStoreValue>();
  private static fallbackHandler?: (key: string, value: IStoreValue) => void;

  constructor() {
    if (Storage.sk === null) {
      const href =
        typeof window !== 'undefined'
          ? window.location.href
          : typeof location !== 'undefined'
            ? location.href
            : 'flappy-bird';
      const match = href.toString().match(/([a-zA-Z-]+\.github\.io\/[a-zA-Z\-.]+\/)/i);
      const key = Array.isArray(match) && match.length > 0 ? match[0] : 'flappy-bird';
      Storage.sk = Storage.utoa(key);
    }

    Storage.isAvailable = false;

    if (typeof window !== 'undefined') {
      try {
        if ('localStorage' in window && typeof window.localStorage === 'object') {
          Storage.isAvailable = true;
        }
      } catch (err) {
        Storage.isAvailable = false;
      }
    }
  }

  static utoa(data: string): string {
    return btoa(encodeURIComponent(data));
  }

  static atou(b64: string): string {
    return decodeURIComponent(atob(b64));
  }

  static save(key: string, value: IStoreValue): void {
    const mode = typeof value;
    const originalValue = value;
    if (typeof value !== 'string') {
      value = String(value);
    }
    if (!Storage.isAvailable) {
      Storage.fallbackStore.set(key, originalValue);
      Storage.fallbackHandler?.(key, originalValue);
      return;
    }
    window.localStorage.setItem(
      `__${Storage.sk! as string}_${key}__`,
      Storage.utoa(JSON.stringify({ mode, value }))
    );
  }

  static get(key: string): IStoreValue | undefined {
    if (!Storage.isAvailable) {
      return Storage.fallbackStore.get(key);
    }

    try {
      const read_item = window.localStorage.getItem(
        `__${Storage.sk! as string}_${key}__`
      );

      if (!read_item) return void 0;

      const obj = JSON.parse(Storage.atou(read_item)) as IData;

      let return_value: IStoreValue | undefined = void 0;

      switch (obj.type) {
        case 'string':
          return_value = String(obj.value);
          break;
        case 'number':
          return_value = Number(obj.value);
          break;
        case 'boolean':
          return_value = obj.value === 'true' ? true : false;
          break;
      }

      return return_value;
    } catch (err) {
      console.error('Failed to fetch highscore');
      return void 0;
    }
  }

  static primeFallback(key: string, value: IStoreValue | undefined): void {
    if (typeof value === 'undefined') return;
    Storage.fallbackStore.set(key, value);
  }

  static registerFallbackHandler(handler: (key: string, value: IStoreValue) => void): void {
    Storage.fallbackHandler = handler;
  }
}
