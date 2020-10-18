/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ResourcePool, ResourceType } from "../abstract";
import { resources } from "../resource/Resources";

import type { APIChannel } from "discord-api-types";
import type { Channel } from "../resource/channel/Channel";
import type { Client } from "../../client";
import type { Guild } from "../resource/guild/Guild";

export class ChannelPool extends ResourcePool<Channel> {
  /**
   * @param {Client} client The client instance.
   */
  public constructor(client: Client) {
    super(client, {
      // @ts-expect-error
      class: resources.get("Channel"),
      resource: ResourceType.Channel
    });
  }

  /**
   * Get a channel.
   * @param {string} id ID of the channel to get.
   *
   * @returns {Channel} The channel
   */
  public get<T extends Channel = Channel>(id: string): T | undefined {
    return this.cache.get(id) as T;
  }

  /**
   * Adds a new channel to this manager.
   * @param {APIChannel} data The channel data.
   * @param {Guild} [guild] The guild instance.
   *
   * @private
   */
  protected _add(data: APIChannel, guild?: Guild): Channel {
    let entry;

    if (guild) {
      entry = guild.channels["_add"](data);
    } else if (data.guild_id) {
      entry = this.client.guilds.cache.get(data.guild_id)
        ?.channels["_add"](data);
    } else {
      entry = this.client.dms["_add"](data);
    }

    return this._set(entry as any);
  }
}