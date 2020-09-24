/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import {
  Collection,
  define,
  Emitter,
  Listener,
  mergeObjects,
} from "@neocord/utils";
import { DiscordStructure } from "../../util";
import { Janitor, JanitorJobs } from "./janitor/Janitor";

const DEFAULTS: Omit<EngineOptions, "handles"> = {
  limit: Infinity,
  janitor: {} as JanitorJobs,
  removeOneOnFull: true,
};

export class MemoryEngine extends Emitter {
  /**
   * The janitor for this engine.
   * @type {Janitor}
   */
  public readonly janitor: Janitor;

  /**
   * The limits for each discord structure.
   * @type {Map<DiscordStructure, number>}
   */
  public readonly limits: Map<DiscordStructure, number>;

  /**
   * The maps for each structure.
   * @type {Record<DiscordStructure, Map<string, *>>}
   * @protected
   */
  protected _maps: Partial<
    Record<DiscordStructure, Collection<string, Cached<Dictionary>>>
  > = {};

  /**
   * Options provided to this engine.
   * @type {EngineOptions}
   * @protected
   */
  protected _options!: Required<EngineOptions>;

  /**
   * @param {EngineOptions} options The options for this engine.
   */
  public constructor(options: EngineOptions = {}) {
    super();

    define({
      value: mergeObjects(options, DEFAULTS),
    })(this, "_options");

    this.janitor = new Janitor(this, this._options.janitor);
    this.limits = new Map();

    if (typeof this._options.limit === "number") {
      for (const s of Object.values(DiscordStructure))
        this.limits.set(s as DiscordStructure, this._options.limit);
    } else {
      this.limits = this._options.limit ?? new Map();
    }
  }

  public on(event: "debug", listener: (message: string) => void): this;
  public on(event: "error", listener: (error: Error | string) => void): this;
  public on(event: string, listener: Listener): this {
    return super.on(event, listener);
  }

  /**
   * Adds an item to the cache.
   * @param {DiscordStructure} structure The structure.
   * @param {*} id The identifier.
   * @param {Cached<*>} data The data that's being cached.
   */
  public set<V extends Dictionary = Dictionary>(
    structure: DiscordStructure,
    id: string,
    data: V | Cached<V>
  ): V | Cached<V> {
    const map = this.getMap(structure),
      limit = (this.limits.get(structure) as number) + 1;

    if (limit === 0) return data;
    if (map.size >= limit && !map.has(id)) {
      if (!this._options.removeOneOnFull) return data;
      const first = map.keys().next().value;
      this.delete(structure, first);
    }

    data.cachedAt = Date.now();
    map.set(id, data as Cached<V>);

    return data;
  }

  /**
   * Clears the cache for a structure.
   * @param {DiscordStructure} structure The structure to clear.
   */
  public clear(structure: DiscordStructure): MemoryEngine {
    this._maps[structure]?.clear();
    delete this._maps[structure];
    return this;
  }

  /**
   * Deletes an item from the cache.
   * @param {DiscordStructure} structure The structure that is getting deleted.
   * @param {*} id ID of the item to delete.
   */
  public delete(structure: DiscordStructure, id: string): boolean {
    const map = this.getMap(structure),
      deleted = map.delete(id);

    if (deleted && map.size === 0) {
      delete this._maps[structure];
    }

    return deleted;
  }

  /**
   * Get an item from the cache.
   * @param {DiscordStructure} structure The type of item to get.
   * @param {string} id The ID of the item to get.
   */
  public get<V extends Dictionary = Dictionary>(
    structure: DiscordStructure,
    id: string
  ): Cached<V> | undefined {
    const map = this.getMap(structure);
    return map.get(id) as Cached<V>;
  }

  /**
   * Get an item from the cache.
   * @param {DiscordStructure} structure The type of item to get.
   * @param {string} id The ID of the item to get.
   */
  public has(structure: DiscordStructure, id: string): boolean {
    const map = this.getMap(structure);
    return map.has(id);
  }

  /**
   * Gets all items from the cache.
   * @param {DiscordStructure} structure The type of items to get.
   * @param {GetAllOptions} options Options to use.
   */
  public all<V extends Dictionary = Dictionary>(
    structure: DiscordStructure,
    options?: GetAllOptions
  ): Collection<string, Cached<V>> {
    const map = this.getMap<V>(structure);

    return options?.limit
      ? new Collection([...map.entries()].slice(0, options.limit))
      : map;
  }

  /**
   * Gets a map for a specific structure.
   * @param {DiscordStructure} structure The structure.
   * @protected
   */
  protected getMap<V extends Dictionary = Dictionary>(
    structure: DiscordStructure
  ): Collection<string, Cached<V>> {
    let map = this._maps[structure];
    if (!map) this._maps[structure] = map = new Collection();
    return map as Collection<string, Cached<V>>;
  }
}

export type Cached<V extends Dictionary> = V & { cachedAt: number };

export interface GetAllOptions extends Dictionary {
  /**
   * The amount of items to return.
   * @type {number}
   */
  limit: number;
}

export interface EngineOptions {
  /**
   * The limit for each structure.
   * @type {number | Map<DiscordStructure | number>}
   */
  limit?: number | Map<DiscordStructure, number>;

  /**
   * The jobs for the janitor.
   * @type {JanitorJobs}
   */
  janitor?: JanitorJobs;

  /**
   * Whether to remove an item from the cache if the limit has been reached.
   * @type {boolean}
   */
  removeOneOnFull?: boolean;
}
