/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Class, Collection } from "@neocord/utils";

import type { Base } from "../structures";
import type { Client } from "../lib";

export abstract class BaseManager<S extends Base> extends Collection<
  string,
  S
> {
  /**
   * The client instance.
   * @type {Client}
   * @private
   */
  private readonly _client!: Client;

  /**
   * The item this manager holds.
   * @type {Class}
   * @private
   */
  protected readonly _item!: Class<S>;

  /**
   * Creates a new instanceof BaseManager
   * @param {Client} client The client instance.
   * @param {Class} item The item this manager holds.
   * @param {Iterable} [iterable] Pre-defined entries.
   */
  protected constructor(
    client: Client,
    item: Class<S>,
    iterable?: Iterable<S>
  ) {
    super();

    Object.defineProperty(this, "_client", { value: client });
    Object.defineProperty(this, "_item", { value: item });

    if (iterable) {
      for (const i of iterable) {
        this._add(i);
      }
    }
  }

  /**
   * Defines the extensibility of this class.
   */
  public static get [Symbol.species](): typeof Collection {
    return Collection;
  }

  /**
   * The client instance.
   * @type {Client}
   */
  public get client(): Client {
    return this._client;
  }

  /**
   * How many items this manager can hold.
   * @type {number}
   */
  public abstract limit(): number;

  /**
   * Resolves something into a structure.
   * @param {string | Base} data The data to resolve.
   * @returns {Base | null} The resolved item or null if nothing was found.
   */
  public resolve(data: BaseResolvable<S>): S | null {
    const id = this.resolveId(data);
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
    if (data instanceof this._item || data.id) return data.id;
    return null;
  }

  /**
   * Sets a value to this store.
   * @param {string} key The entry key.
   * @param {Base} value The entry value.
   * @returns {this}
   */
  public set(key: string, value: S): this {
    if (this.limit() === 0) return this;
    if (this.size >= this.limit() && !this.has(key))
      this.delete(this.first?.id as string);
    return super.set(key, value);
  }

  /**
   * The json representation of this manager.
   * @returns {Array<string>}
   */
  public toJSON(): string[] {
    return [...this.keys()];
  }

  /**
   * Sets an item to this manager.
   * @type {*} data
   * @private
   */
  protected _set(entry: S): S {
    if (this._client.data.enabled.has(entry.structureType))
      this.set(entry.id, entry);

    return entry;
  }

  /**
   * Adds a new item to this manager.
   * @type {Dictionary} data
   * @private
   */
  protected _add(data: Dictionary): S {
    const existing = this.get(data.id);
    if (existing) return existing["_patch"](data);
    return this._set(new this._item(this._client, data));
  }
}

export type BaseResolvable<T extends Base> = T | string | { id: string };
