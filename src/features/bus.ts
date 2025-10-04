export interface FeatureEventMap {
  [event: string]: unknown;
}

export type FeatureEventKey = keyof FeatureEventMap & string;

export type FeatureEventListener<K extends FeatureEventKey> = (
  payload: FeatureEventMap[K],
) => void;

type ListenerSet = Set<FeatureEventListener<FeatureEventKey>>;

export class FeatureBus {
  private readonly listeners = new Map<FeatureEventKey, ListenerSet>();

  private getHandlers<K extends FeatureEventKey>(type: K): Set<FeatureEventListener<K>> | undefined {
    return this.listeners.get(type) as Set<FeatureEventListener<K>> | undefined;
  }

  private ensureHandlers<K extends FeatureEventKey>(type: K): Set<FeatureEventListener<K>> {
    let handlers = this.getHandlers(type);
    if (!handlers) {
      handlers = new Set<FeatureEventListener<K>>();
      this.listeners.set(type, handlers as unknown as ListenerSet);
    }
    return handlers;
  }

  on<K extends FeatureEventKey>(type: K, listener: FeatureEventListener<K>): () => void {
    const handlers = this.ensureHandlers(type);
    handlers.add(listener);
    return () => {
      this.off(type, listener);
    };
  }

  off<K extends FeatureEventKey>(type: K, listener: FeatureEventListener<K>): boolean {
    const handlers = this.getHandlers(type);
    if (!handlers) {
      return false;
    }
    const removed = handlers.delete(listener);
    if (handlers.size === 0) {
      this.listeners.delete(type);
    }
    return removed;
  }

  emit<K extends FeatureEventKey>(type: K, payload: FeatureEventMap[K]): boolean {
    const handlers = this.getHandlers(type);
    if (!handlers || handlers.size === 0) {
      return false;
    }
    handlers.forEach((handler) => {
      handler(payload);
    });
    return true;
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const featureBus = new FeatureBus();

export function resetFeatureBus(): void {
  featureBus.clear();
}
