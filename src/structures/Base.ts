/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import type { Client } from "../internal";
import type { DiscordStructure } from "../util";

export abstract class Base {
  /**
   * The ID of this instance.
   * @type {string}
   */
  public abstract readonly id: string;

  /**
   * The typeof discord structure this is.
   * @type {DiscordStructure}
   */
  public abstract readonly structureType: DiscordStructure;

  /**
   * The client instance.
   * @type {Client}
   */
  private readonly _client!: Client;

  /**
   * Creates a new instance of Base.
   * @param {Client} client The client instance.
   */
  protected constructor(client: Client) {
    Object.defineProperty(this, "_client", {
      value: client,
      writable: false,
      configurable: false,
    });
  }

  /**
   * The client instance.
   * @type {Client}
   */
  public get client(): Client {
    return this._client;
  }

  /**
   * Clones this instance.
   * @returns {Base}
   */
  public _clone(): this {
    return Object.assign(Object.create(this), this);
  }

  /**
   * Freezes this structure.
   * @returns {Readonly<this>}
   */
  public _freeze(): Readonly<this> {
    return Object.freeze(this);
  }

  /**
   * Get the JSON representation of this instance.
   * @returns {Dictionary}
   */
  public toJSON(): Dictionary {
    const dict: Dictionary = {};
    for (const [k, v] of Object.entries(this)) {
      if (k !== "client") Reflect.set(dict, k, v?.id ?? v?.toJSON?.() ?? v);
    }

    return dict;
  }

  /**
   * @param {...*} [data]
   * @protected
   */
  protected _patch(...data: unknown[]): this {
    void data;
    return this;
  }
}
