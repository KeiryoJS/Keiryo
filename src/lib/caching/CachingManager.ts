/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { mergeObjects } from "@neocord/utils";
import { CustomError } from "@neocord/gateway";
import { Cacheable } from "../../util";

import type { Client } from "../client/Client";
import type { CachingProvider } from "./CachingProvider";
import type { Cache } from "./Cache";

const DEFAULTS: CachingOptions = {
  limit: Infinity,
  disable: [],
  providers: []
};

export class CachingManager {
  /**
   * All providers.
   */
  public readonly providers: CachingProvider[];

  /**
   * The client instance.
   */
  public readonly client: Client;

  /**
   * The options passed.
   */
  public readonly options: Required<CachingOptions>;

  /**
   * The disabled cacheables.
   */
  public disabled: Set<Cacheable>;

  /**
   * The cacheable limits.
   */
  public limits: Map<Cacheable, number>;

  /**
   * Creates a new instance of CachingManager.
   * @param client
   * @param options
   */
  public constructor(client: Client, options: CachingOptions = {}) {
    options = mergeObjects(options, DEFAULTS);

    this.client = client;
    this.options = options as Required<CachingOptions>;
    this.disabled = new Set<Cacheable>([ ...options.disable ?? [] ]);
    this.limits = new Map();

    // Configure Limits.
    if (typeof this.options.limit === "number")
      for (const cacheable of Object.values(Cacheable))
        this.limits.set(cacheable as Cacheable, this.options.limit);
    else if (options.limit instanceof Map)
      this.limits = this.options.limit;

    for (const cacheable of Object.values(Cacheable))
      if (!this.limits.has(cacheable as Cacheable))
        this.limits.set(cacheable as Cacheable, Infinity);

    // Configure Providers.
    if (this.options.providers.length > 1 && this.options.providers.some(c => c.cachesAll)) {
      throw new CustomError("CacheError", "Cannot have more than 1 provider if another is caching everything.");
    }

    const providers: CachingProvider[] = [];
    for (const provider of this.options.providers) {
      if (providers.find(p => p.caches.has(provider.caches))) {
        throw new Error("A cacheable may only have one provider.");
      }

      provider.manager = this;
      providers.push(provider);
    }

    this.providers = providers;
  }

  /**
   * Gets a cache.
   * @param cacheable
   * @param args
   */
  public get(cacheable: Cacheable, ...args: unknown[]): Cache<any> {
    return this
      .provider(cacheable)
      .get(cacheable, ...args);
  }

  /**
   * Gets a provider from a cacheable.
   * @param cacheable The cacheable.
   */
  public provider(cacheable: Cacheable): CachingProvider {
    const provider = this.providers.find(c => c.caches.has(cacheable));
    if (!provider) throw new Error(`Cannot find provider for ${Cacheable[cacheable]}`);
    return provider;
  }
}

export interface CachingOptions {
  limit?: Map<Cacheable, number> | number;
  providers?: CachingProvider[];
  disable?: Cacheable[];
}
