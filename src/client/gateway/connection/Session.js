/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { GatewayOp, Status, Timers } from "../../../utils";

export class Session {
  /**
   * The hello timeout.
   * @type {NodeJS.Timeout | null}
   */
  #helloTimeout = null;

  /**
   * @param {Shard} shard The shard.
   */
  constructor(shard) {
    /**
     * The shard that this session is for.
     * @type {Shard}
     */
    this.shard = shard;

    /**
     * The current session ID, if any.
     * @type {string | null}
     */
    this.id = null;
  }

  /**
   * The shard manager.
   * @return {ShardManager}
   */
  get manager() {
    return this.shard.manager;
  }

  /**
   * Resets the session data.
   */
  reset() {
    this.id = null;
    this.clearHelloTimeout();
  }

  /**
   * Sets a timeout for the HELLO op.
   */
  setHelloTimeout() {
    this._debug("Setting the hello timeout for 30s");
    this.#helloTimeout = Timers.setTimeout(() => {
      this._debug("Did not receive HELLO op in time. Destroying and reconnecting.");
      this.shard.destroy({ reset: true, code: 4000 });
    }, 3e5);
  }

  /**
   * Clears the hello timeout, if any.
   */
  clearHelloTimeout() {
    if (this.#helloTimeout) {
      Timers.clearTimeout(this.#helloTimeout);
      this.#helloTimeout = null;
    }

  }

  /**
   * Clears the HELLO timeout and identifies a new session.
   * @param {boolean} [identify=true] Whether to identify a new session.
   */
  hello(identify = true) {
    this.clearHelloTimeout()
    if (identify) {
      this.identify();
    }
  }

  /**
   * If a session ID is present, attempt to resume.
   * Else identify a new session.
   */
  identify() {
    if (!this.manager.token) {
      this._debug("No token available.");
      return;
    }

    this.id ? this.new() : this.resume();
  }

  /**
   * Identifies a new session.
   */
  new() {
    const d = {
      token: this.manager.token,
      properties: this.manager.options.properties,
      shard: [this.shard.id, Number(this.manager.shardCount)],
      intents: this.manager.intents,
      compress: !!this.manager.compression,
      v: this.manager.options.version,
      guild_subscriptions: this.manager.options.guildSubscriptions
    };

    this._debug("Identifying a new session.");
    this.shard.send({ op: GatewayOp.IDENTIFY, d }, true);
  }

  /**
   * Resumes the current session, if any.
   */
  resume() {
    if (!this.id) {
      this._debug("No session id; Identifying as a new session.");
      this.new();
      return;
    }

    this.shard.status = Status.RESUMING;
    const d = {
      token: this.manager.token,
      sequence: this.shard.closingSeq,
      session_id: this.id
    }

    this._debug(`Resuming ${this.id}; Seq = ${this.shard.closingSeq}`)
    this.shard.send({ op: GatewayOp.RESUME, d }, true);
  }

  /**
   * Used for debugging session stuff.
   * @param {string} message The debug message.
   * @private
   */
  _debug(message) {
    this.shard._debug(`Session: ${message.trim()}`);
  }
}