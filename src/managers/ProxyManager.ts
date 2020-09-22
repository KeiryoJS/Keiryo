/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ProxyCollection } from "../util";

import type { Base } from "../structures";
import type { Client } from "../internal";
import type { BaseManager } from "./BaseManager";

export class ProxyManager<S extends Base> extends ProxyCollection<string, S> {
  /**
   * The client instance.
   * @type {Client}
   */
  public readonly client: Client;

  /**
   * Creates a new proxy manager.
   * @param {BaseManager} manager
   * @param {string[]} [keys]
   */
  public constructor(manager: BaseManager<S>, keys?: string[]) {
    super(manager, keys);

    this.client = manager.client;
  }
}
