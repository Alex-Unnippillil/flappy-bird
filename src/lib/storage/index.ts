/**
 * Namespaced wrapper around `window.localStorage` used to persist scores and settings per
 * deployment.
 *
 * Role
 * - Derives a namespace from the current GitHub Pages URL so multiple builds can safely
 *   share the same origin without colliding keys.
 * - Provides helpers for Base64-safe stringification (`utoa`/`atou`) and value type tagging.
 *
 * Inputs & Outputs
 * - `save(key, value)`: accepts a string key and a primitive value (`string | number | boolean`).
 *   The method encodes the value and stores it in `localStorage` if available.
 * - `get(key)`: returns the original primitive value or `undefined` when not found or when
 *   storage is unavailable.
 *
 * Implementation Notes
 * - Availability is checked once in the constructor to avoid quota errors in restricted
 *   environments.
 * - Values are JSON encoded together with their primitive type before Base64 encoding so
 *   retrieval can restore the correct type rather than always returning strings.
 */
export type IStoreValue = string | number | boolean;

type IStoreValueType = 'string' | 'number' | 'boolean';

export interface IData {
  type: IStoreValueType;
  value: string;
}

interface ILegacyData {
  mode?: IStoreValueType;
  type?: IStoreValueType;
  value: string;
}

export default class Storage {
  private static sk: RegExpMatchArray | null | string = window.location.href
    .toString()
    .match(/([a-zA-Z-]+\.github\.io\/[a-zA-Z\-.]+\/)/i);
  private static isAvailable: boolean;

  constructor() {
    if ((Storage.sk ?? []).length < 1) Storage.sk = ['brrrrrrrrrrr'];
    Storage.sk = Storage.utoa(Storage.sk![0]);

    Storage.isAvailable = false;

    try {
      if ('localStorage' in window && typeof window.localStorage === 'object') {
        Storage.isAvailable = true;
      }
    } catch (err) {
      Storage.isAvailable = false;
    }
  }

  static utoa(data: string): string {
    return btoa(encodeURIComponent(data));
  }

  static atou(b64: string): string {
    return decodeURIComponent(atob(b64));
  }

  static save(key: string, value: IStoreValue): void {
    if (!Storage.isAvailable) {
      console.warn('Storage is not available');
      return;
    }

    const type: IStoreValueType = typeof value;

    if (typeof value !== 'string') {
      value = String(value);
    }

    window.localStorage.setItem(
      `__${Storage.sk! as string}_${key}__`,
      Storage.utoa(JSON.stringify({ type, value }))
    );
  }

  static get(key: string): IStoreValue | undefined {
    if (!Storage.isAvailable) {
      console.warn('Storage is not available');
      return void 0;
    }

    try {
      const read_item = window.localStorage.getItem(
        `__${Storage.sk! as string}_${key}__`
      );

      if (!read_item) return void 0;

      const obj = JSON.parse(Storage.atou(read_item)) as ILegacyData;
      const type = obj.type ?? obj.mode;

      if (!type) {
        console.warn(`Storage record is missing type metadata for key: ${key}`);
        return void 0;
      }

      switch (type) {
        case 'string':
          return String(obj.value);
        case 'number':
          return Number(obj.value);
        case 'boolean':
          return obj.value === 'true';
        default: {
          const exhaustiveCheck: never = type;
          console.warn(
            `Storage record has unsupported type metadata "${String(exhaustiveCheck)}" for key: ${key}`
          );
          return void 0;
        }
      }
    } catch (err) {
      console.error(`Failed to read storage value for key: ${key}`);
      return void 0;
    }
  }
}
