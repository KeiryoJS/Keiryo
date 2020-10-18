/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import type { Collection } from "@neocord/utils";
import type { Resource } from "./Resource";
import type { ResourceLike, ResourcePool } from "./ResourcePool";
import type { Client } from "../../client";

export abstract class ResourceProxy<R extends Resource> {
  /**
   * All keys.
   *
   * @type {string[]}
   * @private
   */
  readonly #keys: string[];

  /**
   * The pool this resource proxy wraps.
   *
   * @type {ResourcePool}
   * @private
   */
  readonly #pool: ResourcePool<R>;

  /**
   * @param {ResourcePool} pool The pool this resource proxy wraps.
   */
  protected constructor(pool: ResourcePool<R>) {
    this.#pool = pool;
    this.#keys = [];
  }

  /**
   * All cached resources in this proxy.
   *
   * @type {Collection<string, Resource>}
   * @private
   */
  #_cache?: Collection<string, R>;

  /**
   * All cached resources in this proxy.
   *
   * @type {Collection<string, Resource>}
   */
  public get cache(): Collection<string, R> {
    if (!this.#_cache) {
      this.#_cache = this.pool.cache.filter((_v, k) => this.#keys.includes(k));
    }

    return this.#_cache;
  }

  /**
   * The pool this resource proxy wraps.
   *
   * @type {ResourcePool}
   */
  public get pool(): ResourcePool<R> {
    return this.#pool;
  }

  /**
   * The client instance.
   *
   * @type {Client}
   */
  public get client(): Client {
    return this.#pool.client;
  }

  /**
   * Try to resolve a value into a cached resource.
   * @param {ResourceLike} rl The value to resolve.
   *
   * @returns {?Resource}
   */
  public resolve(rl: ResourceLike<R>): R | null {
    return this.pool.resolve(rl);
  }

  /**
   * Try to resolve a value into it's ID.
   * @param {ResourceLike} rl The value to resolve.
   *
   * @returns {?string}
   */
  public resolveId(rl: ResourceLike<R>): string | null {
    return this.pool.resolveId(rl);
  }

  /**
   * The JSON representation of this resource proxy.
   *
   * @returns {string[]}
   */
  public toJSON(): string[] {
    return [ ...this.#keys ];
  }

  /**
   * Removes a key from this store.
   * @param {any} key
   * @returns {boolean}
   */
  protected _delete(key: string): boolean {
    const i = this.#keys.indexOf(key);
    if (i !== -1) this.#keys.splice(i, 1);
    return i !== -1;
  }

  /**
   * Adds a new resource to the pool.
   * @param {Dictionary} data
   * @param {...args} args
   *
   * @protected
   */
  protected _add(data: Dictionary, ...args: any[]): R {
    this._set(data.id);
    return this.pool["_add"](data, ...args);
  }

  /**
   * Adds a key to the
   * @param {any} key
   *
   * @returns {string}
   */
  protected _set(key: string): string {
    if (!this.#keys.includes(key) && this.pool.cache.has(key))
      this.#keys.push(key);

    return key;
  }
}