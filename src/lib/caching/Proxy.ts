/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Collection } from "@neocord/utils";

// @ts-expect-error
export class Proxy<K, V> extends Collection<K, V> {
  #cache: Collection<K, V>;
  #keys: K[];

  /**
   * Creates a new ProxyCache.
   * @param cache
   * @param keys
   */
  public constructor(cache: Collection<K, V>, keys?: K[]) {
    super();

    this.#cache = cache instanceof Proxy
      ? cache.#cache
      : cache;

    this.#keys = cache instanceof Proxy
      ? cache.#keys.slice()
      : (keys ?? []);
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

  public static [Symbol.species](): typeof Proxy {
    return Proxy;
  }

  /**
   * Get am item from this shared collection.
   * @param key
   */
  public get(key: K): V | undefined {
    return this.#keys.includes(key)
      ? this.#cache.get(key)
      : undefined;
  }

  /**
   * Whether this shared collections contains a key.
   * @param key
   */
  public has(key: K): boolean {
    return this.#keys.includes(key) && this.#cache.has(key);
  }

  /**
   * Adds a key to the
   * @param key
   */
  public set(key: K): this {
    if (!this.#keys.includes(key) && this.#cache.has(key)) this.#keys.push(key);
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
  public forEach(callbackFn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    const fn = callbackFn.bind(thisArg);
    for (const [ k, v ] of this.entries()) {
      fn(v, k, this as any);
    }
  }

  /**
   * Returns a new iterator that contains the k/v pairs for each element in this store.
   */
  public * [Symbol.iterator](): IterableIterator<[ K, V ]> {
    yield * this.entries();
  }

  /**
   * Returns a new iterator that contains the k/v paris for each element in this store.
   */
  public * entries(): IterableIterator<[ K, V ]> {
    for (const pair of this.#cache.entries())
      if (this.#keys.includes(pair[0])) yield pair;
  }

  /**
   * Returns a new iterator that contains the keys for each element in this store.
   */
  public * keys(): IterableIterator<K> {
    for (const key of this.#cache.keys())
      if (this.#keys.includes(key)) yield key;
  }

  /**
   * Returns a new iterator that contains all the values for each element in this store.
   */
  public * values(): IterableIterator<V> {
    for (const [ key, value ] of this.#cache.entries())
      if (this.#keys.includes(key)) yield value;
  }
}
