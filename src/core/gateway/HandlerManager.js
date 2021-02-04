/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Collection } from "../../common";

// handlers
import { UserUpdateHandler } from "./handlers/USER_UPDATE";

export class HandlerManager {
  /**
   * The handlers that currently exist.
   *
   * @type {Collection<string, Handler>}
   */
  #handlers;

  /**
   * The client instance.
   *
   * @type {Client}
   */
  #client;

  /**
   * @param {Client} client The client instance.
   */
  constructor(client) {
    this.#handlers = new Collection();
    this.#client = client;

    client.gateway.on("raw", (payload, shard) => {
      console.log(payload)
      const handler = this.#handlers.get(payload.t);
      if (!handler) {
        this._debug(`Missing event handler for: "${payload.t}"`);
        return
      }

      handler.handle(payload, shard);
    });

    // registering
    this.register(new UserUpdateHandler(client));
  }

  /**
   * Registers a new GatewayEvent handler.
   *
   * @param {Handler} handler The handler.
   */
  register(handler) {
    this.#handlers.set(handler.gatewayEvent, handler);
  }

  /**
   * Used for debugging.
   * @param {string} message The debug message.
   * @private
   */
  _debug(message) {
    this.#client.emit("debug", `event handler: ${message.trim()}`);
  }
}