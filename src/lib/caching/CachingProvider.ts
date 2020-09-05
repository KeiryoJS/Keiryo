/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Cacheable, CacheableResolvable, Cacheables } from "../../util";
import { Cache } from "./Cache";

import type { CachingManager } from "./CachingManager";

// This is a very alpha and like rushed thing.

export class CachingProvider<C extends Cache<any> = Cache<any>> {
  public caches: Cacheables;

  /**
   * The caching manager.
   */
  public manager!: CachingManager;

  /**
   * The cache class.
   * @private
   */
  protected _cache: typeof Cache;

  /**
   * Creates a new instance of CachingProvider.
   * @param options The caching options.
   */
  public constructor(options: ProviderOptions) {
    this.caches = new Cacheables(options.caches);
    this._cache = options.cache ?? Cache;
  }

  /**
   * Whether or not this provider caches everything.
   */
  public get cachesAll(): boolean {
    return this.caches.equals(Cacheables.ALL);
  }

  /**
   * Returns whether or not a cacheable is disabled.
   * @param cacheable
   */
  public isDisabled(cacheable: Cacheable): boolean {
    return this.manager.disabled.has(cacheable);
  }

  /**
   * Returns the limit for a certain cacheable.
   * @param cacheable The cacheable.
   */
  public getLimit(cacheable: Cacheable): number {
    return this.manager.limits.get(cacheable) ?? Infinity;
  }

  /**
   * Gets a new cache instance.
   * @param cacheable
   * @param args
   */
  public get(cacheable: Cacheable, ...args: unknown[]): C {
    return new this._cache(this, cacheable, ...args) as C;
  }
}

export interface ProviderOptions {
  caches: CacheableResolvable;
  cache?: typeof Cache;
}
