/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Collection } from "@neocord/utils";

// @ts-expect-error
export class ProxyCollection<K, V> extends Collection<K, V> {
  #store: Map<K, V>;
  #keys: K[];

  /**
   * @param store
   * @param keys
   */
  public constructor(store: Map<K, V>, keys?: K[]) {
    super();

    this.#store = store instanceof ProxyCollection ? store.#store : store;

    this.#keys =
      store instanceof ProxyCollection ? store.#keys.slice() : keys ?? [];
  }

  public static get [Symbol.species](): typeof ProxyCollection {
    return ProxyCollection;
  }

  /**
   * Returns the number of keys in this collection.
   */
  public get size(): number {
    return this.#keys.length;
  }

  /**
   * Returns the string tag of this instance.
   */
  public get [Symbol.toStringTag](): string {
    return "Map";
  }

  /**
   * Get am item from this shared collection.
   * @param key
   */
  public get(key: K): V | undefined {
    return this.#keys.includes(key) ? this.#store.get(key) : undefined;
  }

  /**
   * Whether this shared collections contains a key.
   * @param key
   */
  public has(key: K): boolean {
    return this.#keys.includes(key) && this.#store.has(key);
  }

  /**
   * Adds a key to the
   * @param key
   */
  public set(key: K): this {
    if (!this.#keys.includes(key) && this.#store.has(key)) this.#keys.push(key);
    return this;
  }

  /**
   * Removes a key from this store.
   * @param key
   */
  public delete(key: K): boolean {
    const i = this.#keys.indexOf(key);
    if (i !== -1) this.#keys.splice(i, 1);
    return i !== -1;
  }

  /**
   * Clears all keys from this store.
   */
  public clear(): this {
    this.#keys = [];
    return this;
  }

  /**
   * Executes a provided function for each k/v pair in the store.
   * @param callbackFn
   * @param thisArg
   */
  public forEach(
    callbackFn: (value: V, key: K, map: Map<K, V>) => void,
    thisArg?: unknown
  ): void {
    const fn = callbackFn.bind(thisArg);
    for (const [k, v] of this.entries()) {
      fn(v, k, this as any);
    }
  }

  /**
   * Returns a new iterator that contains the k/v pairs for each element in this store.
   */
  public *[Symbol.iterator](): IterableIterator<[K, V]> {
    yield* this.entries();
  }

  /**
   * Returns a new iterator that contains the k/v paris for each element in this store.
   */
  public *entries(): IterableIterator<[K, V]> {
    for (const pair of this.#store.entries())
      if (this.#keys.includes(pair[0])) yield pair;
  }

  /**
   * Returns a new iterator that contains the keys for each element in this store.
   */
  public *keys(): IterableIterator<K> {
    for (const key of this.#store.keys())
      if (this.#keys.includes(key)) yield key;
  }

  /**
   * Returns a new iterator that contains all the values for each element in this store.
   */
  public *values(): IterableIterator<V> {
    for (const [key, value] of this.#store.entries())
      if (this.#keys.includes(key)) yield value;
  }
}
