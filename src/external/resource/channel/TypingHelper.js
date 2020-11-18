/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Timers } from "@neocord/utils";

export class TypingHelper {
  /**
   * The interval to send typing requests.
   * @type {?NodeJS.Timeout}
   */
  #interval = null;

  /**
   * The interval typing counter.
   * @type {number}
   */
  #count = 0;

  /**
   * @param {TextBasedChannel} channel The text channel.
   */
  constructor(channel) {
    this.channel = channel;
  }

  /**
   * The client instance.
   * @return {Client}
   */
  get client() {
    return this.channel.client;
  }

  /**
   * Increases the interval count and starts typing if not already.
   * @param {number} [count=1] How much to increase the interval count.
   * @returns {Promise<TypingHelper>} This instanceof Typing.
   */
  async start(count = 1) {
    this.#count += count;
    if (!this.#interval) {
      await this._start();
    }

    return this;
  }

  /**
   * Decreases the interval count and stops typing if the count is 0 or lower.
   * @param {number} [count=1] How much to decrease the interval count.
   * @returns {TypingHelper} This instanceof Typing.
   */
  stop(count = 1) {
    this.#count -= count;
    if (this.#count < 0) {
      this.#count = 0;
    }

    if (!this.#count) {
      this._stop();
    }

    return this;
  }

  /**
   * Starts the typing interval if not already started.
   * @returns {Promise<void>} Nothing...
   */
  async _start() {
    if (this.#interval) {
      return;
    }

    await this._send();
    this.#interval = Timers.setInterval(() => this._send(), 9000);
  }

  /**
   * Stops the typing interval if not already stopped.
   */
  _stop() {
    if (!this.#interval) return;
    Timers.clearInterval(this.#interval);
    this.#interval = null;
  }

  /**
   * Triggers the typing indicator in the channel.
   */
  async _send() {
    try {
      await this.client.rest.post(`/channels/${this.channel.id}/typing`);
    } catch {
      this.#count = 0;
      this._stop();
    }
  }
}