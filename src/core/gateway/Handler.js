/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Collection, MethodNotImplementedError } from "../../common";

export class Handler {
  /**
   * @param {Client} client The client instance.
   */
  constructor(client) {
    if (this.constructor === Handler) {
      throw new Error("The \"Handler\" class is abstract, therefore it shouldn't be instantiated.");
    }

    /**
     * The client instance.
     * @type {Client}
     */
    this.client = client;
  }

  /**
   * The name of the event this handles.
   *
   * @type {string}
   */
  get gatewayEvent() {
    return Reflect.get(this.constructor, "gatewayEvent");
  }

  /**
   * The client event to be used.
   *
   * @type {string}
   */
  get clientEvent() {
    return this.gatewayEvent.split("_").map(p => p.capitalize()).join(" ");
  }

  /**
   * Handles a payload we received from Discord.
   *
   * @param {DiscordPayload} payload The received payload.
   * @param {Shard} shard The shard that received this payload.
   */
  handle(payload, shard) {
    throw new MethodNotImplementedError();
  }

  /**
   * Emits an event using Handler#clientEvent
   *
   * @param {...any} args The arguments to pass.
   */
  emit(...args) {
    return this.client.emit(this.clientEvent, ...args);
  }
}

/**
 * Used for declaring the event name for a handler.
 *
 * @param {string} event
 *
 * @returns {ClassDecorator}
 */
export function event(event) {
  return target => {
    if (target.prototype instanceof Handler) {
      throw new TypeError("This decorator can only be used on internal neocord classes.");
    }

    Reflect.defineProperty(target, "gatewayEvent", {
      value: event
    });
  };
}
