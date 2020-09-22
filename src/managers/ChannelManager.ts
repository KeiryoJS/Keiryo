/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { BaseManager } from "./BaseManager";
import { neo } from "../structures";
import { DiscordStructure } from "../util";

import type { Channel } from "../structures/channel/Channel";
import type { Client } from "../lib";
import type { APIChannel } from "discord-api-types";
import type { Guild } from "../structures/guild/Guild";

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
   * @type {number}
   */
  public limit(): number {
    return this.client.data.limits.get(DiscordStructure.Channel) ?? Infinity;
  }

  /**
   * Get a channel.
   * @param {string} id ID of the channel to get.
   * @returns {Channel} The channel
   */
  public get<T extends Channel = Channel>(id: string): T | undefined {
    return super.get(id) as T;
  }

  /**
   * Adds a new channel to this manager.
   * @private
   */
  protected _add(data: APIChannel, guild?: Guild): Channel {
    let entry;

    if (guild) entry = guild.channels["_add"](data);
    else if (data.guild_id)
      entry = this.client.guilds.get(data.guild_id)?.channels["_add"](data);
    else entry = this.client.dms["_add"](data);

    return this._set(entry as any);
  }
}
