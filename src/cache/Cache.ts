/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import type { Dictionary } from "../common";

/**
 * Used for customizing the caching behavior of one or more resources.
 * It is recommended that any connection to a database (like redis) is separated as this can be instantiated multiple times.
 */
export abstract class Cache {
  /**
   * Fetches a value from the cache.
   *
   * @param {string} id The resource id.
   *
   * @returns {Promise<Resource>} The cached resource.
   */
  abstract get(id: string): Promise<Dictionary | undefined>;

  /**
   * Adds a resource to the cache.
   *
   * @param {string} id The resource id.
   * @param {Dictionary} value The raw resource data.
   */
  abstract set(id: string, value: Dictionary): Promise<Cache>;

  /**
   * Removes a resource from the cache.
   *
   * @param {string} id The resource id.
   *
   * @returns {boolean} Whether the resource was removed.
   */
  abstract delete(id: string): Promise<boolean>;

  /**
   * Used for fetching multiple resources from the cache.
   *
   * @param {number} [limit] The total number of resources to fetch.
   *
   * @returns {Promise<Dictionary[]>} The fetched resources.
   */
  abstract fetch(limit?: number): Promise<Dictionary[]>;
}
