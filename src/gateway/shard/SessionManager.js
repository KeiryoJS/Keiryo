/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { GatewayOp, Status } from "../constants";

export class SessionManager {

  /**
   * The current session id.
   * @type {string}
   * @private
   */
  _id;

  /**
   * Handles the session for a shard.
   * @param {WorkerShard} shard The shard.
   */
  constructor(shard) {
    /**
     * The shard..
     * @type {WorkerShard}
     */
    this.shard = shard;
  }

  /**
   * The current session id.
   * @returns {string}
   */
  get id() {
    return this._id;
  }

  /**
   * Set the session id.
   * @param {string} id The session id received from discord.
   */
  set id(id) {
    this._id = id;
  }

  /**
   * If a session id is present, it will try to resume, else it identify as a new session.
   */
  identify() {
    return this._id
      ? this.resume()
      : this.new();
  }

  /**
   * Identifies a new session.
   */
  new(force = false) {
    if (this._id && !force) {
      throw new Error(`A session id is present, did you mean to call "SessionManager#reset" before this?`);
    }

    const d = {
      token: this.shard._options.token,
      properties: this.shard._options.properties,
      shard: [ +this.shard.id, +this.shard._options.totalShards ],
      intents: +this.shard._options.intents,
      compress: !!this.shard._decompressor,
      v: +this.shard._options.gatewayVersion
    };

    this._debug("identifying as a new session.");
    this.shard.sendPayload({ op: GatewayOp.IDENTIFY, d }, true);
  }

  /**
   * Resumes the current session, if any.
   */
  resume() {
    if (!this._id) {
      this._debug("no session id; identifying as a new session.");
      this.new();
      return;
    }

    this.shard.dispatch("UPDATE_STATUS", Status.RESUMING);
    const d = {
      token: this.shard._options.token,
      sequence: this.shard._closingSeq,
      session_id: this._id
    };

    this._debug(`resuming ${this._id}, seq = ${this.shard._closingSeq}`);
    this.shard.sendPayload({ op: GatewayOp.RESUME, d }, true);
  }

  /**
   * Used for session debugging.
   * @param {string} message The debug message.
   * @private
   */
  _debug(message) {
    this.shard._debug(`session: ${message.trim()}`);
  }
}
