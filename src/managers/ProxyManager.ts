/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import type { Base } from "../structures";
import type { BaseManager } from "./BaseManager";
import type { Client } from "../internal";
import { Collection } from "@neocord/utils";

export class ProxyManager<S extends Base> extends Collection<string, S> {
  /**
   * The manager this proxies.
   * @type {BaseManager}
   */
  public readonly manager: BaseManager<S>;

  #keys: string[];

  /**
   * Creates a new proxy manager.
   * @param {BaseManager} manager
   * @param {string[]} [keys]
   */
  public constructor(manager: BaseManager<S>, keys?: string[]) {
    super();

    this.manager = manager;
    this.#keys = keys ?? [];
  }

  /**
   * The client instance.
   * @type {Client}
   */
  public get client(): Client {
    return this.manager.client;
  }

  /**
   * Returns the number of keys in this collection.
   * @type {number}
   */
  public get size(): number {
    return this.#keys.length;
  }

  /**
   * Returns the string tag of this instance.
   * @type {string}
   */
  public get [Symbol.toStringTag](): string {
    return "Map";
  }

  /**
   * Get am item from this shared collection.
   * @param {any} key
   * @returns {* | undefined}
   */
  public get(key: string): S | undefined {
    return this.#keys.includes(key) ? this.manager.get(key) : undefined;
  }

  /**
   * Whether this shared collections contains a key.
   * @param {any} key
   * @returns {boolean}
   */
  public has(key: string): boolean {
    return this.#keys.includes(key) && this.manager.has(key);
  }

  /**
   * Adds a key to the
   * @param {any} key
   * @returns {ProxyManager}
   */
  public set(key: string): this {
    if (!this.#keys.includes(key) && this.manager.has(key))
      this.#keys.push(key);
    return this;
  }

  /**
   * Removes a key from this store.
   * @param {any} key
   * @returns {boolean}
   */
  public delete(key: string): boolean {
    const i = this.#keys.indexOf(key);
    if (i !== -1) this.#keys.splice(i, 1);
    return i !== -1;
  }

  /**
   * Clears all keys from this store.
   * @returns {ProxyManager}
   */
  public clear(): this {
    this.#keys = [];
    return this;
  }

  /**
   * Executes a provided function for each k/v pair in the store.
   * @param {Function} callbackFn
   * @param {any} [thisArg]
   */
  public forEach(
    callbackFn: (value: S, key: string, map: Map<string, S>) => void,
    thisArg?: unknown
  ): void {
    const fn = callbackFn.bind(thisArg);
    for (const [k, v] of this.entries()) {
      fn(v, k, this as any);
    }
  }

  /**
   * Returns a new iterator that contains the k/v pairs for each element in this store.
   * @returns {IterableIterator}
   */
  public *[Symbol.iterator](): IterableIterator<[string, S]> {
    yield* this.entries();
  }

  /**
   * Returns a new iterator that contains the k/v pairs for each element in this store.
   * @returns {IterableIterator}
   */
  public *entries(): IterableIterator<[string, S]> {
    for (const pair of this.manager.entries())
      if (this.#keys.includes(pair[0])) yield pair;
  }

  /**
   * Returns a new iterator that contains the keys for each element in this store.
   * @returns {IterableIterator<*>}
   */
  public *keys(): IterableIterator<string> {
    for (const key of this.manager.keys())
      if (this.#keys.includes(key)) yield key;
  }

  /**
   * Returns a new iterator that contains all the values for each element in this store.
   * @returns {IterableIterator<*>}
   */
  public *values(): IterableIterator<S> {
    for (const [key, value] of this.manager.entries())
      if (this.#keys.includes(key)) yield value;
  }
}
