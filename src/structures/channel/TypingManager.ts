/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Timers } from "@neocord/utils";

import type { Client } from "../../internal";
import type { TextBasedChannel } from "./Channel";

export class TypingManager {
  /**
   * The channel instance.
   * @type {TextBasedChannel}
   */
  readonly #channel: TextBasedChannel;

  /**
   * The interval typing counter.
   * @type {number}
   */
  #count = 0;

  /**
   * The interval to send typing requests.
   * @type {NodeJS.Timeout | null}
   */
  #interval: NodeJS.Timeout | null = null;

  /**
   * Creates a new instanceof Typing.
   * @param {TextBasedChannel} channel The channel instance.
   */
  public constructor(channel: TextBasedChannel) {
    this.#channel = channel;
  }

  /**
   * The client instance.
   * @type {Client}
   */
  public get client(): Client {
    return this.#channel.client;
  }

  /**
   * Increases the interval count and starts typing if not already.
   * @param {number} [count=1] How much to increase the interval count.
   * @returns {Promise<Typing>} This instanceof Typing.
   */
  public async start(count = 1): Promise<this> {
    this.#count += count;
    if (!this.#interval) await this._start();
    return this;
  }

  /**
   * Decreases the interval count and stops typing if the count is 0 or lower.
   * @param {number} [count=1] How much to decrease the interval count.
   * @returns {Typing} This instanceof Typing.
   */
  public stop(count = 1): this {
    this.#count -= count;
    if (this.#count < 0) this.#count = 0;
    if (!this.#count) this._stop();
    return this;
  }

  /**
   * Forces the typing count to 0 and stops typing.
   * @returns {Typing} This instanceof Typing.
   */
  public forceStop(): this {
    return this.stop(Infinity);
  }

  /**
   * Starts the typing interval if not already started.
   * @returns {Promise<void>} Nothing...
   */
  protected async _start(): Promise<void> {
    if (this.#interval) return;
    await this._send();
    this.#interval = Timers.setInterval(() => this._send(), 9000);
  }

  /**
   * Stops the typing interval if not already stopped.
   * @returns {void} Nothing...
   */
  protected _stop(): void {
    if (!this.#interval) return;
    Timers.clearInterval(this.#interval);
    this.#interval = null;
  }

  /**
   * Triggers the typing indicator in the channel.
   * @returns {Promise<void>} Nothing...
   */
  protected async _send(): Promise<void> {
    try {
      await this.client.api.post(`/channels/${this.#channel.id}/typing`);
    } catch {
      this.#count = 0;
      this._stop();
    }
  }
}
