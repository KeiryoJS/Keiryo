import { Timers } from "@neocord/utils";

import type { TextBasedChannel } from "./Channel";
import type { Client } from "../../../client";

export class TypingManager {
  /**
   * The interval to send typing requests.
   *
   * @type {?NodeJS.Timeout}
   * @private
   */
  #interval: NodeJS.Timeout | null;

  /**
   * The interval typing counter.
   *
   * @type {number}
   * @private
   */
  #count: number;

  /**
   * The text channel this typing manager is for.
   *
   * @type {TextBasedChannel}
   * @private
   */
  readonly #channel: TextBasedChannel;

  /**
   * @param {TextBasedChannel} channel The text channel.
   */
  public constructor(channel: TextBasedChannel) {
    this.#interval = null;
    this.#count = 0;
    this.#channel = channel;
  }

  /**
   * The client instance.
   *
   * @type {Client}
   */
  public get client(): Client {
    return this.#channel.client;
  }

  /**
   * Increases the interval count and starts typing if not already.
   * @param {number} [count=1] How much to increase the interval count.
   *
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
   *
   * @returns {Typing} This instanceof Typing.
   */
  public stop(count = 1): this {
    this.#count -= count;
    if (this.#count < 0) this.#count = 0;
    if (!this.#count) this._stop();
    return this;
  }

  /**
   * Starts the typing interval if not already started.
   *
   * @returns {Promise<void>} Nothing...
   */
  protected async _start(): Promise<void> {
    if (this.#interval) return;
    await this._send();
    this.#interval = Timers.setInterval(() => this._send(), 9000);
  }

  /**
   * Stops the typing interval if not already stopped.
   *
   * @returns {void} Nothing...
   */
  protected _stop(): void {
    if (!this.#interval) return;
    Timers.clearInterval(this.#interval);
    this.#interval = null;
  }

  /**
   * Triggers the typing indicator in the channel.
   *
   * @returns {Promise<void>} Nothing...
   */
  protected async _send(): Promise<void> {
    try {
      await this.client.rest.post(`/channels/${this.#channel.id}/typing`);
    } catch {
      this.#count = 0;
      this._stop();
    }
  }
}
