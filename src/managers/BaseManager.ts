/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */


import { Class, Collection } from "@neocord/utils";

import type { Base } from "../structures/Base";
import type { Cache, Client } from "../lib";

export abstract class BaseManager<T extends Base> extends Collection<string, T> {
  /**
   * The client instance.
   */
  public readonly client: Client;

  /**
   * The thing this manager manages.
   */
  public readonly manages: Class<T>;

  /**
   * The cache for this manager.
   * @protected
   */
  public readonly abstract cache: Cache<T>

  /**
   * Creates a new instance of BaseManager.
   * @param client The client instance.
   * @param structure
   */
  protected constructor(client: Client, structure: Class<T>) {
    super();

    this.client = client;
    this.manages = structure;
  }

  public resolve(data: unknown): T | null {
    const id = this.resolveId(data);
    if (!id) return null;
    return this.get(id) ?? null;
  }

  /**
   * Attempts to resolve an id from a value.
   * @param data
   */
  public resolveId(data: unknown): string | null {
    if (typeof data === "string") return data;
    if (data instanceof this.manages) return data.id;
    return null;
  }

  /**
   * Gets an entry from the cache.
   * @param key The key of the entry to get.
   */
  public get(key: string): T | undefined {
    return this.cache.get(key);
  }

  /**
   * Sets an on the cache.
   * @param key The entry key.
   * @param value The entry value.
   */
  public set(key: string, value: T): this {
    this.cache.set(key, value);
    return this;
  }

  /**
   * All of the keys in the cache.
   */
  public * keys(): IterableIterator<string> {
    yield * this.cache.keys();
  }

  /**
   * All of the values in the cache.
   */
  public * values(): IterableIterator<T> {
    yield * this.cache.values();
  }

  /**
   * All entries in the cache.
   */
  public * entries(): IterableIterator<[ string, T ]> {
    yield * this.cache.entries();
  }

  /**
   * The json representation of this store.
   */
  public toJSON(): string[] {
    return [ ...this.keys() ];
  }

  /**
   * @private
   */
  protected _set(entry: T): T {
    this.set(entry.id, entry);
    return entry;
  }

  /**
   * Adds a new item to this store.
   * @param data
   * @private
   */
  protected _add(data: Dictionary): T {
    const existing = this.get(data.id);
    if (existing) return existing["_patch"](data);
    return this._set(new (this.manages)(this.client, data));
  }
}
