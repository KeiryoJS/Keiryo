/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Timers } from "./Timers";

export class Bucket {
  /**
   * @param {number} tokenLimit
   * @param {number} interval
   * @param {BucketOptions} [options]
   */
  constructor(tokenLimit, interval, options = {}) {
    /**
     * The max number tokens the bucket can consume per interval.
     * @type {number}
     */
    this.tokenLimit = tokenLimit;

    /**
     * How long (in ms) to wait between clearing used tokens.
     * @type {number}
     */
    this.interval = interval;

    /**
     * @type {number}
     */
    this.lastReset = 0;

    /**
     * Timestamp of last token consumption.
     * @type {number}
     */
    this.lastSend = 0;

    /**
     * How many tokens the bucket has consumed in this interval.
     * @type {number}
     */
    this.tokens = 0;

    /**
     * The latency.
     * @type {number}
     */
    this.latency = options.latency ?? 0;

    /**
     * The number of reserved tokens.
     * @type {number}
     */
    this.reservedTokens = options.reservedTokens ?? 0;

    /**
     * The queue
     * @type {Queued[]}
     * @private
     */
    this._queue = [];

    /**
     * The timeouts.
     * @type {Timers}
     * @private
     */
    this._timers = new Timers();
  }

  reset() {
    this.tokens = this.lastSend = this.lastReset = 0;
    this.lock = [];
    this._timers.clear();
  }

  /**
   * Queue something in the Bucket.
   * @param {Function} func A callback to call when a token can be consumed
   * @param {boolean} [priority=false] Whether or not the callback should use reserved tokens
   */
  queue(func, priority = false) {
    this._queue[priority ? "unshift" : "push"]({ func, priority });
    this._check();
  }

  /**
   * Checks the bucket.
   * @private
   */
  _check() {
    if (this.timeout || !this._queue.length) {
      return;
    }

    if (this.lastReset + this.interval + this.tokenLimit + this.latency < Date.now()) {
      this.lastReset = Date.now();
      this.tokens = Math.max(0, this.tokens - this.tokenLimit);
    }

    let val, [rta, ta] = [this._available(), this._available(true)];
    while (this._queue.length > 0 && (ta || (rta && this._queue[0].priority))) {
      this.tokens++;
      rta = this._available();
      ta = this._available(true);

      const item = this._queue.shift();

      val = this.latency - Date.now() + this.lastSend;
      if (this.latency === 0 || val <= 0) {
        item.func();
        this.lastSend = Date.now();
      } else {
        this._timers.setTimeout(() => item.func(), val);
        this.lastSend = Date.now() + val;
      }
    }

    if (this._queue.length > 0 && !this.timeout) {
      const delay = this._available()
        ? this.latency
        : Math.max(0, this.lastReset + this.interval + this.tokenLimit + this.latency - Date.now());

      /**
       * The queue timeout.
       * @type {number}
       */
      this.timeout = this._timers.setTimeout(() => {
        delete this.timeout;
        this._check();
      }, delay);
    }
  }

  /**
   * Whether any tokens are available.
   * @type {boolean}
   * @private
   */
  _available(unreserved = false) {
    return this.tokens < (unreserved ? this.tokenLimit - this.reservedTokens : this.tokenLimit);
  }
}

/**
 * @typedef {Object} Queued
 * @property {Function} func
 * @property {boolean} priority
 */

/**
 * @typedef {Object} BucketOptions
 * @property {number} [reservedTokens]
 * @property {number} [latency]
 */