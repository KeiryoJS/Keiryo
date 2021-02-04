/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Collection, PartialRecord } from "../common";
import { ResourceType } from "./Resource";
import { InMemoryCache } from "./InMemoryCache";

import type { Cache } from "./Cache";

export class CacheManager {
  /**
   * The configured caches.
   *
   * @type {Caches}
   */
  readonly caches: Collection<ResourceType, CacheGetter>;

  /**
   * @param {CacheManagerOptions} options The cache manager options.
   */
  constructor(options: CacheManagerOptions = {}) {
    this.caches = Collection.from(this._caches(options.caches));
  }

  /**
   * Returns the cache for the provided resource.
   *
   * @param {ResourceType} resource The resource
   *
   * @returns {Cache} The configured cache.
   */
  getCache(resource: ResourceType): Cache {
    return this.caches.get(resource)?.() ?? new InMemoryCache();
  }

  /**
   * Used for validating a provided caches object.
   *
   * @param {Caches} caches The provided caches.
   *
   * @private
   */
  private _caches(caches: PartialRecord<ResourceType, () => Cache> = {}): Caches {
    const omitted = Reflect.ownKeys(ResourceType).filter(k => !Reflect.has(caches, k));
    for (const rt of omitted) {
      Reflect.set(caches, rt, () => new InMemoryCache());
    }

    return caches as Caches;
  }
}

type CacheGetter = () => Cache;
type Caches = Record<ResourceType, CacheGetter>

export interface CacheManagerOptions {
  caches?: PartialRecord<ResourceType, CacheGetter>
}
