import { AbstractLoader } from './abstraction';

export interface IPromiseResolve {
  source: string;
  object: unknown;
}

export type ILoaders = new (source: string) => AbstractLoader;
