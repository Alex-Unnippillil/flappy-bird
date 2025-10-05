/**
 * Shared type declarations for the asset loader subsystem.
 *
 * Role
 * - Describes the payload resolved by loader promises and the constructor signature that concrete
 *   loader implementations must follow.
 *
 * Inputs & Outputs
 * - `IPromiseResolve` defines the `{ source, object }` tuple emitted by each loader.
 * - `ILoaders` is consumed by `asset-loader/index.ts` to store class constructors in its registry.
 */
import { AbstractLoader } from './abstraction';

export interface IPromiseResolve {
  source: string;
  object: any;
}

export type ILoaders = new (source: string) => AbstractLoader;
