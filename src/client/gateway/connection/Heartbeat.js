/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Status, GatewayOp, Timers } from "../../../utils";

export class Heartbeat {
  /**
   * The heartbeat interval.
   * @type {NodeJS.Timeout | null}
   */
  #interval = null;

  /**
   * @param {Shard} shard The shard.
   */
  constructor(shard) {
    /**
     * The shard that this heartbeat belongs to.
     * @type {Shard}
     */
    this.shard = shard;

    /**
     * Whether the last heartbeat was acknowledged by the gateway.
     * @type {boolean}
     */
    this.acked = false;

    /**
     * Timestamp of the last heartbeat, or 0 if heart-beating hasn't started.
     * @type {number}
     */
    this.last = 0;

    /**
     * The delay between each heartbeat.
     * @type {number | null}
     * @private
     */
    this._delay = null;
  }

  /**
   * Set the heartbeat delay.
   * @param {number} ms
   */
  set delay(ms) {
    if (this._delay) {
      this.reset();
    }

    this._delay = ms;
    this._init();
  }

  /**
   * Resets this heartbeat.
   */
  reset() {
    this.acked = false;
    this.last = 0;
    this._delay = null;
    this.clearInterval()
  }

  /**
   * Clears the heartbeat interval, if any.
   */
  clearInterval() {
    if (this.#interval) {
      Timers.clearInterval(this.#interval);
      this.#interval = null;
    }
  }

  /**
   * Called whenever the gateway acknowledges the last heartbeat.
   */
  ack() {
    this.acked = true;
    this.shard.latency = Date.now() - this.last;
    this._debug(`Our heartbeat was acknowledged, Lat. ${this.shard.latency}ms`);
  }

  /**
   * Sends a heartbeat to the gateway.
   * @param {string} reason The heartbeat reason.
   * @param {boolean} [ignore] The statuses to ignore,
   */
  new(
    reason,
    ignore = [
      Status.IDENTIFYING,
      Status.RESUMING,
      Status.WAITING_FOR_GUILDS
    ].includes(this.shard.status)
  ) {
    if (ignore && !this.acked) {
      this._debug("Didn't process last heartbeat ack yet but we are still connected. Sending one now...");
    } else if (!this.acked) {
      this._debug("Didn't receive a heartbeat last time. Assuming zombie connection, destroying and reconnecting.");
      this._debug(`Zombie Connection: Status = ${Status[this.shard.status]}, Seq = ${this.shard.sequence}`);
      return this.shard.destroy({ code: 4009, reset: true });
    }

    this._debug(`‹${reason}› Sending a heartbeat to the gateway.`);
    this.shard.send({ op: GatewayOp.HEARTBEAT, d: this.shard.seq === -1 ? null : this.shard.seq });
    this.acked = false;
    this.last = Date.now();
  }

  /**
   * Used for debugging the heartbeat of a shard.
   * @param {string} message The debug message.
   * @private
   */
  _debug(message) {
    this.shard._debug(`Heartbeat: ${message.trim()}`);
  }

  /**
   * Starts the heartbeat interval.
   * @private
   */
  _init() {
    this._debug(`Now heart-beating every: ${this._delay}ms`);
    this.#interval = Timers.setInterval(() => this.new("interval"), this._delay);
  }
}