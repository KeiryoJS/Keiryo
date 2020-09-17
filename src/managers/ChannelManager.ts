/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { BaseManager } from "./BaseManager";
import { neo } from "../structures/Extender";

import type { Channel } from "../structures/channel/Channel";
import type { Client } from "../lib";

export class ChannelManager extends BaseManager<Channel> {
  /**
   * Creates a new instanceof ChannelManager
   * @param {Client} client The client instance.
   */
  public constructor(client: Client) {
    super(client, neo.get("Channel"));
  }

  /**
   * The total amount of channels that can be cached at one point in time.
   */
  public get limit(): number {
    return Infinity;
  }

  /**
   * Get a channel.
   * @param {string} id ID of the channel to get.
   * @returns {Channel} The channel
   */
  public get<T extends Channel = Channel>(id: string): T | undefined {
    return super.get(id) as T;
  }
}
