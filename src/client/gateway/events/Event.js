/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { capitalize } from "@neocord/utils";

/**
 * @private
 */
export class Event {
  /**"
   * @param {Client} client The client instance.
   */
  constructor(client) {
    /**
     * The client instance.
     * @type {Client}
     */
    this.client = client;
  }

  /**
   * The name of this handler. Also used as the value for filtering packets.
   * @type {GatewayEvent}
   */
  get name() {
    return this.constructor.name;
  }

  /**
   * The event to use for client events.
   * @type {string}
   */
  get clientEvent() {
    const [ f, ...rest ] = this.name.split("_");
    return f.toLowerCase() + rest.map((r) => capitalize(r, true)).join("");
  }

  /**
   * Emit the event associated with this handler.
   * @param {...*} args The arguments to pass.
   */
  emit(...args) {
    this.client.emit(this.clientEvent, ...args);
  }
}