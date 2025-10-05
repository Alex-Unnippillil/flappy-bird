// File Overview: This module belongs to src/lib/high-contrast-manager.ts.

import Storage from './storage';

export interface IHighContrastPalette {
  pipeFill: string;
  pipeStroke: string;
  pipeAccent: string;
  birdFill: string;
  birdStroke: string;
  birdAccent: string;
  scoreboardBackground: string;
  scoreboardBorder: string;
  scoreboardText: string;
  scoreboardAccent: string;
}

type IHighContrastListener = (enabled: boolean) => void;

export default class HighContrastManager {
  private static enabled = false;
  private static listeners = new Set<IHighContrastListener>();
  private static initialized = false;
  private static palette: IHighContrastPalette | null = null;
  private static pendingApply = false;

  public static init(): void {
    this.ensureInitialized();
    this.applyToDocument();
  }

  public static setEnabled(value: boolean): void {
    this.ensureInitialized();

    if (this.enabled === value) return;

    this.enabled = value;
    Storage.save('high-contrast', value);
    this.applyToDocument();

    this.listeners.forEach((handler) => handler(value));
  }

  public static isEnabled(): boolean {
    this.ensureInitialized();
    return this.enabled;
  }

  public static subscribe(listener: IHighContrastListener): () => void {
    this.ensureInitialized();
    this.listeners.add(listener);
    listener(this.enabled);

    return () => {
      this.listeners.delete(listener);
    };
  }

  public static getPalette(): IHighContrastPalette {
    this.ensureInitialized();

    if (!this.palette) {
      this.refreshPalette();
    }

    if (!this.palette) {
      // Fallback palette in case computed styles are unavailable.
      return {
        pipeFill: '#111111',
        pipeStroke: '#ffffff',
        pipeAccent: '#ffd60a',
        birdFill: '#ffffff',
        birdStroke: '#000000',
        birdAccent: '#ff8c00',
        scoreboardBackground: 'rgba(0,0,0,0.92)',
        scoreboardBorder: '#ffffff',
        scoreboardText: '#ffffff',
        scoreboardAccent: '#ffd60a'
      };
    }

    return this.palette;
  }

  private static ensureInitialized(): void {
    if (this.initialized) return;

    if (typeof window === 'undefined') {
      this.initialized = true;
      return;
    }

    new Storage();

    const stored = Storage.get('high-contrast');
    this.enabled = typeof stored === 'boolean' ? stored : false;
    this.initialized = true;
    this.applyToDocument();
  }

  private static applyToDocument(): void {
    if (typeof document === 'undefined') return;

    // `document.body` can be null while the DOM is still streaming.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!document.body) {
      if (!this.pendingApply) {
        this.pendingApply = true;
        window.addEventListener(
          'DOMContentLoaded',
          () => {
            this.pendingApply = false;
            this.applyToDocument();
          },
          { once: true }
        );
      }
      return;
    }

    document.body.classList.toggle('high-contrast', this.enabled);
    this.refreshPalette();
  }

  private static refreshPalette(): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (typeof window === 'undefined' || !document.body) return;

    const styles = window.getComputedStyle(document.body);
    const read = (variable: string, fallback: string): string => {
      const value = styles.getPropertyValue(variable).trim();
      return value.length > 0 ? value : fallback;
    };

    this.palette = {
      pipeFill: read('--hc-pipe-fill', '#111111'),
      pipeStroke: read('--hc-pipe-stroke', '#ffffff'),
      pipeAccent: read('--hc-pipe-accent', '#ffd60a'),
      birdFill: read('--hc-bird-fill', '#ffffff'),
      birdStroke: read('--hc-bird-stroke', '#000000'),
      birdAccent: read('--hc-bird-accent', '#ff8c00'),
      scoreboardBackground: read('--hc-scoreboard-bg', 'rgba(0,0,0,0.92)'),
      scoreboardBorder: read('--hc-scoreboard-border', '#ffffff'),
      scoreboardText: read('--hc-scoreboard-text', '#ffffff'),
      scoreboardAccent: read('--hc-scoreboard-accent', '#ffd60a')
    };
  }
}
