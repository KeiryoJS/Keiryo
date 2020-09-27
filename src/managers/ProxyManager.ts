/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import type { Base } from "../structures";
import type { BaseManager } from "./BaseManager";
import type { Client } from "../internal";
import { Collection } from "@neocord/utils";

export class ProxyManager<S extends Base> {
  /**
   * The manager this proxies.
   * @type {BaseManager}
   */
  public readonly manager: BaseManager<S>;

  /**
   * All keys.
   * @private
   */
  #keys: string[];

  /**
   * Creates a new proxy manager.
   * @param {BaseManager} manager
   * @param {string[]} [keys]
   */
  public constructor(manager: BaseManager<S>, keys?: string[]) {
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
   * Cached items for this manager.
   * @type {Collection<string, S>}
   */
  public get cache(): Collection<string, S> {
    return this.manager.cache.filter((_v, k) => this.#keys.includes(k));
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
    return this.#keys.includes(key) ? this.cache.get(key) : undefined;
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
   * Adds a key to the
   * @param {any} key
   * @returns {ProxyManager}
   */
  protected _set(key: string): this {
    if (!this.#keys.includes(key) && this.manager.has(key))
      this.#keys.push(key);

    return this;
  }
}

for (const prop of ["each", "some", "map", "reduce", "find", "first", "last"]) {
  Object.defineProperty(
    ProxyManager.prototype,
    prop,
    Reflect.getOwnPropertyDescriptor(
      Collection.prototype,
      prop
    ) as PropertyDescriptor
  );
}

export interface ProxyManager<S extends Base> {
  /**
   * The first item in this manager.
   * @type {Base | null}
   */
  first: S | null;

  /**
   * The last item in this manager.
   * @type {Base | null}
   */
  last: S | null;

  /**
   * Tests whether or not an entry in this manager meets the provided predicate.
   * @param {Function} predicate A predicate that tests all entries.
   * @param {any} thisArg An optional binding for the predicate function.
   */
  some(
    predicate: (value: S, key: string, col: this) => unknown,
    thisArg?: unknown
  ): boolean;

  /**
   * Collection#forEach but it returns the manager instead of nothing.
   * @param {Function} fn The function to be ran on all entries.
   * @param {any} thisArg An optional binding for the fn parameter.
   */
  each(
    fn: (value: S, key: string, col: this) => unknown,
    thisArg?: unknown
  ): this;

  /**
   * Finds a value using a predicate from this manager.
   * @param {Function} fn Function used to find the value.
   * @param {any} thisArg Optional binding to use.
   */
  find(
    fn: (value: S, key: string, col: this) => boolean,
    thisArg?: unknown
  ): S | null;

  /**
   * Reduces this manager down into a single value.
   * @template {any} A
   * @param {Function} fn The function used to reduce this manager.
   * @param {A} acc The accumulator.
   * @param {any} thisArg Optional binding for the reducer function.
   * @returns
   */
  reduce<A>(
    fn: (acc: A, value: S, key: string, col: this) => A,
    acc: A,
    thisArg?: unknown
  ): A;

  /**
   * Maps this manager into an array. Array#map equivalent.
   * T - The type of element of each element in the returned array.
   * @template {any} T
   * @param {Function} fn Function used to map values to an array.
   * @param {any} thisArg Optional binding for the map function.
   * @returns {T[]}
   */
  map<T>(fn: (value: S, key: string, col: this) => T, thisArg?: unknown): T[];

  /**
   * Returns a clone of this collection.
   * @returns {Collection<string, Base>}
   */
  clone(): Collection<string, S>;
}
