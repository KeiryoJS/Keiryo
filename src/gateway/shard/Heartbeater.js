/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Timers } from "../../common";
import { GatewayOp } from "../constants";

export class Heartbeater {
  /**
   * Handles a Heartbeat for a Shard.
   *
   * @param {WorkerShard} shard The shard.
   */
  constructor(shard) {
    /**
     * The shard.
     *
     * @type {WorkerShard}
     */
    this.shard = shard;

    /**
     * Whether the last heartbeat was acknowledged by the gateway.
     *
     * @type {boolean}
     */
    this.acked = false;

    /**
     * Timestamp of the last heartbeat, or 0 if heart-beating hasn't started.
     *
     * @type {number}
     */
    this.last = 0;

    /**
     * The latency between the gateway and us.
     *
     * @type {number}
     */
    this.latency = 0;

    /**
     * The delay between each heartbeat.
     *
     * @type {number | null}
     *
     * @private
     */
    this._delay = null;

    /**
     * The heartbeat interval, or null if it hasn't been started.
     *
     * @type {NodeJS.Timeout | null}
     *
     * @private
     */
    this._interval = null;
  }

  /**
   * Set the delay between each heartbeat.
   *
   * @param {number} ms The delay in milliseconds.
   */
  set delay(ms) {
    if (this._delay) {
      // Have to reset the heartbeat before setting a new one.
      this.reset();
    }

    this._delay = ms;
    this._debug(`Now heart-beating every ${ms}ms`);

    Reflect.defineProperty(this, "_interval", {
      value: Timers.setInterval(() => this.new("interval"), ms),
      enumerable: false
    });
  }

  /**
   * Resets this heartbeater.
   */
  reset() {
    this.acked = false;
    this.last = 0;
    this._delay = null;
    this.clear();
  }

  /**
   * Clears the heartbeat interval, if any.
   */
  clear() {
    if (this._interval) {
      Timers.clearInterval(this._interval);
      Reflect.deleteProperty(this, "_interval");
    }
  }

  /**
   * Called whenever the gateway has acknowledged the last heartbeat.
   */
  ack() {
    this.acked = false;
    this.latency = Date.now() - this.last;

    this._debug(`Our heartbeat was acknowledged, we have a latency of ${this.latency}ms`);
  }

  /**
   * Sends a new heartbeat to the gateway.
   *
   * @param {string} reason The heartbeat reason.
   */
  new(reason) {
    this
      ._debug(`<${reason}> heart-beating...`).shard
      .sendPayload({
        op: GatewayOp.HEARTBEAT,
        d: this.shard._seq === -1 ? null : this.shard._seq
      });

    this.acked = true;
    this.last = Date.now();
  }

  /**
   * Used for debugging the heartbeat of a shard.
   *
   * @param {string} message The debug message.
   *
   * @private
   */
  _debug(message) {
    this.shard._debug(`heartbeat: ${message.trim()}`);
    return this;
  }
}
