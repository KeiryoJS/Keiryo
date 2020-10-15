/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import type { Client } from "../../client";

/**
 * Represents a Discord Resource like a Guild, User, Channel, etc...
 */
export abstract class Resource {
  /**
   * The ID of this resource.
   *
   * @type {string}
   */
  public abstract readonly id: string;

  /**
   * The client instance of this resource.
   *
   * @type {Client}
   * @private
   */
  readonly #client: Client;

  /**
   * @param {Client} client The client instance.
   */
  protected constructor(client: Client) {
    this.#client = client;
  }

  /**
   * The client instance of this resource.
   *
   * @type {Client}
   */
  public get client(): Client {
    return this.#client;
  }

  /**
   * Clones this instance.
   *
   * @returns {Resource}
   */
  public _clone(): this {
    return Object.assign(Object.create(this), this);
  }

  /**
   * Freezes this structure.
   *
   * @returns {Readonly<Resource>}
   */
  public _freeze(): Readonly<this> {
    return Object.freeze(this);
  }

  /**
   * Patch this resource.
   * @param {Dictionary} data The data.
   * @param {...any} [args] Optional arguments.
   */
  protected _patch(data: Dictionary, ...args: unknown[]): this {
    void data;
    void args;
    return this;
  }
}
