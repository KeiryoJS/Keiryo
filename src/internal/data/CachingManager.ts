/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Emitter, Listener, mergeObjects } from "@neocord/utils";
import { DiscordStructure } from "../../util";
import { Cache } from "./Cache";

import type { Base } from "../../structures";
import type { Janitor } from "./janitor/Janitor";

const DEFAULTS: CachingOptions = {
  limit: Infinity,
  removeOneOnFull: true,
  disabled: [],
};

export class CachingManager extends Emitter {
  /**
   * The limits for each discord structure.
   * @type {Map<DiscordStructure, number>}
   */
  public readonly limits: Map<DiscordStructure, number>;

  /**
   * Structures that wont be cached.
   * @type {Set<DiscordStructure>}
   */
  public readonly disabled: Set<DiscordStructure>;

  /**
   * Options provided to this Caching.
   * @type {CachingOptions}
   * @protected
   */
  readonly #options!: Required<CachingOptions>;

  /**
   * The janitor.
   * @private
   */
  readonly #janitor!: Janitor;

  /**
   * @param {Janitor} janitor
   * @param {CachingOptions} [options] The options for this Caching.
   */
  public constructor(janitor: Janitor, options: CachingOptions = {}) {
    super();

    this.#options = mergeObjects(options, DEFAULTS);
    this.#janitor = janitor;

    this.limits = new Map();
    this.disabled = new Set(options.disabled ?? []);

    if (typeof this.#options.limit === "number") {
      for (const s of Object.values(DiscordStructure))
        this.limits.set(s as DiscordStructure, this.#options.limit);
    } else {
      this.limits = this.#options.limit ?? new Map();
    }
  }

  public on(event: "debug", listener: (message: string) => void): this;
  public on(event: "error", listener: (error: Error | string) => void): this;
  public on(event: string, listener: Listener): this {
    return super.on(event, listener);
  }

  /**
   * Creates a new cache.
   * @param {DiscordStructure} structure The structure.
   * @returns {Cache}
   */
  public new<V extends Base = Base>(structure: DiscordStructure): Cache<V> {
    return new Cache<V>(this.#janitor, {
      limit: this.limits.get(structure) as number,
      removeOneOnFull: this.#options.removeOneOnFull,
      disabled: this.disabled.has(structure),
      structure,
    });
  }
}

export interface CachingOptions {
  /**
   * The limit for each structure.
   * @type {number | Map<DiscordStructure | number>}
   */
  limit?: number | Map<DiscordStructure, number>;

  /**
   * The structures to disable.
   * @type {Set<DiscordStructure> | DiscordStructure[]}
   */
  disabled?: Set<DiscordStructure> | DiscordStructure[];

  /**
   * Whether to remove an item from the cache if the limit has been reached.
   * @type {boolean}
   */
  removeOneOnFull?: boolean;
}
