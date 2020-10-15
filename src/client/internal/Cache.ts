/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Collection } from "@neocord/utils";

import type { Resource } from "../../external/abstract/Resource";
import type { ResourceType } from "../../external/abstract/ResourceType";

export class Cache<R extends Resource> extends Collection<string, R> {
  /**
   * The max amount of resources to cache.
   *
   * @type {number}
   */
  public readonly limit: number;

  /**
   * The type of resource this cache is for.
   *
   * @type {ResourceType}
   */
  public readonly resource: ResourceType;

  /**
   * @param {Tuple<string, Resource>} [iterable] The iterable.
   * @param {CacheData} [data] The cache data.
   */
  public constructor(iterable?: Tuple<string, R>[], data?: CacheData) {
    const _data = data as CacheData;
    super(iterable);

    this.limit = _data.limit;
    this.resource = _data.resource;
  }

  /**
   * Adds a resource to the cache.
   * @param {string} id The resource's ID.
   * @param {Resource} resource The resource.
   */
  public set(id: string, resource: R): this {
    if (this.limit === 0) {
      return this;
    }

    if (this.size >= this.limit && !this.has(id)) {
      const first = this.keys().next().value;
      this.delete(first);
    }

    return super.set(id, resource);
  }
}

export interface CacheData {
  resource: ResourceType;
  limit: number;
}
