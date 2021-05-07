/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { EventEmitter } from "../common";
import { REST, RESTEvent } from "../rest";
import { ShardManager, ShardManagerEvent } from "../gateway";
import { HandlerManager } from "./gateway/HandlerManager";

export class Client extends EventEmitter {
  /**
   * The REST instance, used for interacting with the Discord API.
   *
   * @type {this}
   */
  #rest;

  /**
   * The ShardManager instance, used for spawning shards.
   *
   * @type {this}
   */
  #gateway;

  /**
   * @param {ClientOptions} options The client options.
   */
  constructor(options = {}) {
    super();

    this.#rest = new REST(options.rest)
      .on(RESTEvent.DEBUG, (...args) => this.emit("debug", ...args))
      .on(RESTEvent.RATE_LIMITED, (...args) => this.emit("rateLimited", ...args));

    this.#gateway = new ShardManager(this.rest, options.ws)
      .on(ShardManagerEvent.DEBUG, (...args) => this.emit("debug", ...args))
      .on(ShardManagerEvent.READY, (...args) => this.emit("ready", ...args));

    /**
     * The handlers manager.
     *
     * @type {HandlerManager}
     */
    this.handlers = new HandlerManager(this);
  }

  /**
   * The REST instance, used for interacting with the Discord API.
   *
   * @type {Client}
   */
  get rest() {
    return this.#rest;
  }

  /**
   * The ShardManager instance.
   *
   * @type {Client}
   */
  get gateway() {
    return this.#gateway;
  }

  /**
   * Connects to the discord gateway.
   * @param {string} token Your bot token.
   * @returns {Promise<void>}
   */
  async connect(token = this.token) {
    if (!token) {
      throw new Error("Client#Token: You must provide a token.");
    }

    this.rest.token = token;

    try {
      await this.#gateway.connect(token);
    } catch (e) {
      await this.destroy();
      throw e;
    }
  }

  async destroy() {

  }
}