/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Collection } from "@neocord/utils";

import type { Janitor } from "./janitor/Janitor";
import type { DiscordStructure } from "../../util";
import type { Base } from "../../structures";

export class Cache<V extends Base> extends Collection<string, Cached<V>> {
  /**
   * The options for this cache.
   * @type {CacheOptions}
   * @private
   */
  readonly #options: CacheOptions;

  /**
   * @param {Janitor} janitor the janitor.
   * @param {CacheOptions} options The options for this cache.
   */
  public constructor(janitor: Janitor, options: CacheOptions) {
    super();

    this.#options = options;

    const job = janitor.jobs.get(options.structure);
    if (job) {
      job.caches.add(this);
    }
  }

  /**
   * Adds an item to the cache.
   * @param {string} id The identifier.
   * @param {Cached<*>} data The data that's being cached.
   */
  public set(id: string, data: Cached<V> | V): this {
    if (this.#options.limit === 0 || this.#options.disabled) return this;
    if (this.size >= this.#options.limit && !this.has(id)) {
      if (!this.#options.removeOneOnFull) return this;
      const first = this.keys().next().value;
      this.delete(first);
    }

    Object.defineProperty(data, "cachedAt", {
      value: (data as Cached<V>).cachedAt = Date.now(),
      writable: true,
    });

    super.set(id, data as Cached<V>);
    return this;
  }
}

export type Cached<V extends Dictionary> = V & { cachedAt: number };

interface CacheOptions {
  /**
   * The limit for each structure.
   * @type {number}
   */
  limit: number;

  /**
   * Whether to remove an item from the cache if the limit has been reached.
   * @type {boolean}
   */
  removeOneOnFull: boolean;

  /**
   * Whether this cache is disabled.
   * @type {boolean}
   */
  disabled: boolean;

  /**
   * The discord structure that this caches.
   * @type {DiscordStructure}
   */
  structure: DiscordStructure;
}
