/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Collection } from "@neocord/utils";

import type { CachingProvider } from "./CachingProvider";
import type { Cacheable } from "../../util";
import type { Base } from "../../structures/Base";

// @ts-ignore
export class Cache<V extends Base> extends Collection<string, V> {
  /**
   * The provider instance.
   */
  public readonly provider: CachingProvider;

  /**
   * The cacheable.
   */
  public readonly cacheable: Cacheable;

  /**
   * Creates a new instanceof Cache.
   * @param provider The provider.
   * @param cacheable The thing we're caching.
   * @param args
   */
  public constructor(provider: CachingProvider, cacheable: Cacheable, ...args: unknown[]) {
    super();

    void args;
    this.provider = provider;
    this.cacheable = cacheable;
  }

  public static get [Symbol.species](): typeof Cache {
    return Cache;
  }

  /**
   * Adds an entry to this cache.
   * @param key The entry key.
   * @param value The entry value.
   */
  public set(key: string, value: V): this {
    if (this.provider.isDisabled(this.cacheable)) return this;

    const limit = this.provider.getLimit(this.cacheable);
    if (limit === 0) return this;
    if (this.size >= limit && !this.has(key)) this.delete(this.first?.id as string);

    return super.set(key, value);
  }
}
