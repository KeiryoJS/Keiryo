/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Timers } from "@neocord/utils";

import type { Client } from "../../lib";
import type { DMChannel } from "./DMChannel";
import type { GuildTextChannel } from "./guild/GuildTextChannel";

export class Typing {
  /**
   * The client instance.
   */
  public readonly client: Client;

  /**
   * The channel instance.
   */
  public readonly channel: DMChannel | GuildTextChannel;

  /**
   * The interval typing counter.
   */
  private _count = 0;

  /**
   * The interval to send typing requests.
   */
  private _interval: NodeJS.Timeout | null = null;

  /**
   * Creates a new instanceof Typing.
   * @param {CanTypeIn} channel The channel instance.
   */
  public constructor(channel: DMChannel | GuildTextChannel) {
    this.client = channel.client;
    this.channel = channel;
  }

  /**
   * Increases the interval count and starts typing if not already.
   * @param {number} [count=1] How much to increase the interval count.
   * @returns {Promise<Typing>} This instanceof Typing.
   */
  public async start(count = 1): Promise<this> {
    this._count += count;
    if (!this._interval) await this._start();
    return this;
  }

  /**
   * Decreases the interval count and stops typing if the count is 0 or lower.
   * @param {number} [count=1] How much to decrease the interval count.
   * @returns {Typing} This instanceof Typing.
   */
  public stop(count = 1): this {
    this._count -= count;
    if (this._count < 0) this._count = 0;
    if (!this._count) this._stop();
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
    if (this._interval) return;
    await this._send();
    this._interval = Timers.setInterval(() => this._send(), 9000);
  }

  /**
   * Stops the typing interval if not already stopped.
   * @returns {void} Nothing...
   */
  protected _stop(): void {
    if (!this._interval) return;
    Timers.clearInterval(this._interval);
    this._interval = null;
  }

  /**
   * Triggers the typing indicator in the channel.
   * @returns {Promise<void>} Nothing...
   */
  protected async _send(): Promise<void> {
    try {
      await this.client.api.post(`/channels/${this.channel.id}/typing`);
    } catch {
      this._count = 0;
      this._stop();
    }
  }
}
