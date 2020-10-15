/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import type { Class } from "@neocord/utils";
import type { Resource } from "./Resource";
import type { Cache, Client } from "../../client";
import type { ResourceType } from "./ResourceType";

/**
 * Represents a pool for specific resources.
 */
export abstract class ResourcePool<R extends Resource> {
  /**
   * The class this pool manages.
   *
   * @type {Class}
   * @private
   */
  protected class: Class<R>;

  /**
   * The resource cache for this pool.
   *
   * @type {ResourceCache<Resource>}
   * @private
   */
  readonly #cache: Cache<R>;

  /**
   * The client instance.
   *
   * @type {Client}
   * @private
   */
  readonly #client: Client;

  /**
   * @param {Client} client The client instance.
   * @param {ResourcePoolData} data Data for this resource pool.
   */
  protected constructor(client: Client, data: ResourcePoolData<R>) {
    this.class = data.class;

    this.#client = client;
    this.#cache = client.caching.getCache(data.resource);
  }

  /**
   * The resource cache for this pool.
   *
   * @type {ResourceCache<Resource>}
   */
  public get cache(): Cache<R> {
    return this.#cache;
  }

  /**
   * The number of cached resources.
   *
   * @type {number}
   */
  public get size(): number {
    return this.#cache.size;
  }

  /**
   * The client instance.
   *
   * @type {Client}
   */
  public get client(): Client {
    return this.#client;
  }

  /**
   * Try to resolve a value into a cached resource.
   * @param {ResourceLike} rl The value to resolve.
   *
   * @returns {?Resource}
   */
  public resolve(rl: ResourceLike<R>): R | null {
    const id = this.resolveId(rl);
    if (!id) {
      return null;
    }

    return this.#cache.get(id) ?? null;
  }

  /**
   * Try to resolve a value into it's ID.
   * @param {ResourceLike} rl The value to resolve.
   *
   * @returns {?string}
   */
  public resolveId(rl: ResourceLike<R>): string | null {
    if (typeof rl === "string") {
      return rl;
    }

    if (rl instanceof this.class || rl.id) {
      return rl.id;
    }

    return null;
  }

  /**
   * The JSON representation of this resource pool.
   *
   * @returns {string[]}
   */
  public toJSON(): string[] {
    return [ ...this.#cache.keys() ];
  }

  /**
   * Adds an item to the cache.
   * @param {Resource} resource The resource.
   *
   * @returns {Resource}
   * @protected
   */
  protected _set(resource: R): R {
    this.#cache.set(resource.id, resource);
    return resource;
  }

  /**
   * Creates a new resource with data from Discord.
   * @param {Dictionary} data The data to use.
   * @param {...any} args Arguments that will be passed to the constructor.
   *
   * @returns {Resource}
   * @protected
   */
  protected _add(data: Dictionary, ...args: unknown[]): R {
    const existing = this.#cache.get(data.id);
    if (existing) {
      existing["_patch"](data, ...args);
      return existing;
    }

    const resource = this._create(data, ...args);
    return this._set(resource);
  }

  /**
   * Creates a new resource.
   * @param {Dictionary}data
   * @param args
   *
   * @protected
   */
  protected _create(data: Dictionary, ...args: unknown[]): R {
    return new this.class(this.client, data, ...args);
  }
}

export type ResourceLike<R extends Resource> = R | string | { id: string };

interface ResourcePoolData<R extends Resource> {
  resource: ResourceType;
  class: Class<R>;
}
