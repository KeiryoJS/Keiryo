/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Cache } from "./Cache";
import { Collection, Dictionary } from "../common";

export class InMemoryCache extends Cache {
  /**
   * Used for checking whether this is the in-memory cache.
   */
  static readonly IN_MEMORY = true;

  /**
   * The in-memory cache.
   *
   * @type {Collection<string, Dictionary>}
   * @private
   */
  #cache = new Collection<string, Dictionary>();

  /**
   * The total number of resources allowed to be cached at once.
   *
   * @type {number}
   */
  total: number;

  /**
   * @param {InMemoryCacheOptions} options The options for this in-memory cache.
   */
  constructor(options: InMemoryCacheOptions = {}) {
    super();

    this.total = options.total ?? Infinity;
  }

  /**
   * Removes a resource from the cache.
   *
   * @param {string} id The resource id.
   *
   * @returns {boolean} Whether the resource was removed.
   */
  async delete(id: string): Promise<boolean> {
    return this.#cache.delete(id);
  }

  /**
   * Used for fetching multiple resources from the cache.
   *
   * @param {number} [limit] The total number of resources to fetch.
   *
   * @returns {Promise<Dictionary[]>} The fetched resources.
   */
  async fetch(limit?: number): Promise<Dictionary[]> {
    const resources = this.#cache.array();
    return limit ? resources.slice(0, limit) : resources;
  }

  /**
   * Fetches a value from the cache.
   *
   * @param {string} id The resource id.
   *
   * @returns {Promise<Resource>} The cached resource.
   */
  async get(id: string): Promise<Dictionary | undefined> {
    return this.#cache.get(id);
  }

  /**
   * Adds a resource to the cache.
   *
   * @param {string} id The resource id.
   * @param {Dictionary} value The raw resource data.
   */
  async set(id: string, value: Dictionary): Promise<Cache> {
    if (this.total === 0) {
      return this;
    }

    this.#cache.set(id, value);
    if (this.#cache.size > this.total) {
      while (this.#cache.size > this.total) {
        const first = this.#cache.first()!;
        this.#cache.delete(first[0]);
      }
    }

    return this;
  }
}

export interface InMemoryCacheOptions {
  /**
   * The total number of resources allowed to be cached at one time.
   *
   * @type {number}
   */
  total?: number;
}

