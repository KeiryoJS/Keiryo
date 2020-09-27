/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Class, Collection, define } from "@neocord/utils";
import * as Util from "util";

import type { Cache, Client } from "../internal";
import type { Base } from "../structures";
import type { DiscordStructure } from "../util";

export const CLASS = Symbol.for("BaseManagerClass");
export const STRUCTURE = Symbol.for("BaseManagerStructure");

export class BaseManager<S extends Base> {
  /**
   * The class to use.
   * @type {Class}
   * @protected
   */
  protected [CLASS]: Class<S>;

  /**
   * The structure this manager manages.
   * @type {DiscordStructure}
   * @protected
   */
  protected [STRUCTURE]: DiscordStructure;

  /**
   * The cache instance.
   */
  readonly #cache: Cache<S>;

  /**
   * The client instance.
   * @type {Client}
   * @private
   */
  readonly #client!: Client;

  /**
   * @param {Client} client The client instance.
   * @param {ManagerData} data The data for this manager.
   */
  public constructor(client: Client, data: ManagerData<S>) {
    // @ts-expect-error
    define({ value: data.class })(this, CLASS);
    // @ts-expect-error
    define({ value: data.structure })(this, STRUCTURE);

    this.#client = client;
    this.#cache = client.data.cache.new(this[STRUCTURE]);
  }

  /**
   * The number of cached items in this
   */
  public get size(): number {
    return this.cache.size;
  }

  /**
   * The client instance.
   * @type {Client}
   */
  public get client(): Client {
    return this.#client;
  }

  /**
   * The custom inspect text.
   * @returns {string}
   */
  public get [Util.inspect.custom](): string {
    return "xd";
  }

  /**
   * The cache of this base manager.
   * @type {Cache<Base>}
   */
  public get cache(): Cache<S> {
    return this.#cache;
  }

  /**
   * @returns {typeof Collection}
   */
  public static [Symbol.species](): typeof Collection {
    return Collection;
  }

  /**
   * Resolves something into a usable object.
   * @param {BaseResolvable} item The item to resolve.
   * @returns {Promise<Base | null>}
   */
  public resolve(item: BaseResolvable<S>): S | null {
    const id = this.resolveId(item);
    if (!id) return null;
    return this.get(id) ?? null;
  }

  /**
   * Resolves something into an ID
   * @param {string | Base} data The data to resolve.
   * @returns {string} The resolved ID or null if nothing was found.
   */
  public resolveId(data: BaseResolvable<S>): string | null {
    if (typeof data === "string") return data;
    if (data instanceof this[CLASS] || data.id) return data.id;
    return null;
  }

  /**
   * Clears the cache.
   * @type {string}
   */
  public clear(): BaseManager<S> {
    this.cache.clear();
    return this;
  }

  /**
   * Gets an item from the cache.
   * @param {string} id
   * @returns {Base | null}
   */
  public get(id: string): S | undefined {
    return this.cache.get(id);
  }

  /**
   * Whether an item is in the cache.
   * @param {string} id The ID of the item to check for.
   * @returns {boolean}
   */
  public has(id: string): boolean {
    return this.cache.has(id);
  }

  /**
   * The value iterator for this manager.
   * @returns {IterableIterator<string, Base>}
   */
  public [Symbol.iterator](): IterableIterator<[string, S]> {
    return this.entries();
  }

  /**
   * Runs a function on each entry of this manager
   * @param {Function} fn The function ran each iteration.
   * @param {any} thisArg Optional binding for the predicate.
   * @returns {Collection<string, Base>}
   */
  public forEach(
    fn: (value: S, key: string, col: Map<string, S>) => void,
    thisArg?: unknown
  ): void {
    if (thisArg) fn = fn.bind(thisArg);
    this.cache.forEach(fn, thisArg);
    return;
  }

  /**
   * Returns a filtered collection based on the provided predicate.
   * @param {Function} fn The predicate used to determine whether or not an entry can be passed to the new collection.
   * @param {*} thisArg Optional binding for the predicate.
   */
  public filter(
    fn: (value: S, key: string, col: this) => boolean,
    thisArg?: unknown
  ): Collection<string, S> {
    if (thisArg) fn = fn.bind(thisArg);

    const col = new Collection();
    for (const [k, v] of this) {
      if (fn(v, k, this)) col.set(k, v);
    }

    return col as Collection<string, S>;
  }

  /**
   * Returns a clone of this collection.
   * @returns {Collection<string, Base>}
   */
  public clone(): Collection<string, S> {
    return new Collection<string, S>(this.entries());
  }

  /**
   * The json representation of this manager.
   * @returns {Array<string>}
   */
  public toJSON(): string[] {
    return [...this.keys()];
  }

  /**
   * The keys iterator.
   * @returns {AsyncIterator<[string, Base]>}
   */
  public *keys(): IterableIterator<string> {
    yield* this.cache.keys();
  }

  /**
   * The keys iterator.
   * @returns {AsyncIterator<[string, Base]>}
   */
  public *entries(): IterableIterator<[string, S]> {
    yield* this.cache.entries();
  }

  /**
   * The keys iterator.
   * @returns {AsyncIterator<[string, Base]>}
   */
  public *values(): IterableIterator<S> {
    yield* this.cache.values();
  }

  /**
   * Adds an item to this manager.
   * @param {Base} item The item to add.
   * @protected
   */
  protected _set(item: S): S {
    this.cache.set(item.id, item);
    return item;
  }

  /**
   * Adds an item to this manager.
   * @param {Dictionary} data
   * @param {...*} args Args to pass to the class.
   * @protected
   */
  protected _add(data: Dictionary, ...args: unknown[]): S {
    const existing = this.cache.get(data.id);
    if (existing) existing["_patch"](data);
    return this._set(new this[CLASS](this.client, data, ...args));
  }
}

for (const prop of ["each", "some", "map", "reduce", "find", "first", "last"]) {
  Object.defineProperty(
    BaseManager.prototype,
    prop,
    Reflect.getOwnPropertyDescriptor(
      Collection.prototype,
      prop
    ) as PropertyDescriptor
  );
}

export type BaseResolvable<T extends Base> = T | string | { id: string };

export interface BaseManager<S extends Base> {
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
   * Returns a filtered manager based on the provided predicate.
   * @param fn The predicate used to determine whether or not an entry can be passed to the new collection.
   * @param {any} thisArg Optional binding for the predicate.
   * @returns {Collection<string, Base>}
   */
  filter(
    fn: (value: S, key: string, col: this) => boolean,
    thisArg?: unknown
  ): Collection<string, S>;

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

export interface ManagerData<S extends Base> {
  /**
   * The class to use when instantiating things.
   * @type {Class}
   */
  class: Class<S>;

  /**
   * The structure that this manager handles.
   * @type {DiscordStructure}
   */
  structure: DiscordStructure;
}
