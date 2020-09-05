/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import type { Client } from "../lib";

export abstract class Base {
  /**
   * The client instance.
   */
  public readonly client: Client;

  /**
   * The ID of this instance.
   */
  public readonly abstract id: string;

  /**
   * Creates a new instance of Base.
   * @param client The client instance.
   */
  protected constructor(client: Client) {
    this.client = client;
  }

  /**
   * Clones this instance.
   */
  public clone(): this {
    return Object.assign(Object.create(this), this);
  }

  /**
   * Get the JSON representation of this instance.4
   */
  public toJSON(): Dictionary {
    const dict: Dictionary = {};
    for (const [ k, v ] of Object.entries(this)) {
      if (k !== "client")
        Reflect.set(dict, k, v?.id ?? v?.toJSON?.() ?? v);
    }

    return dict;
  }

  /**
   * @protected
   */
  protected _patch(...data: unknown[]): this {
    void data;
    return this;
  }
}
