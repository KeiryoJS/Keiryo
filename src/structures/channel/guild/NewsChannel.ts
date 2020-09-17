/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { APIFollowedChannel, ChannelType } from "discord-api-types";
import { GuildTextChannel, ModifyGuildTextChannel } from "./GuildTextChannel";
import { CategoryChannel } from "./CategoryChannel";
import { Message } from "../../message/Message";

export class NewsChannel extends GuildTextChannel {
  /**
   * The type of this channel.
   * @type {ChannelType.GUILD_NEWS}
   */
  public readonly type = ChannelType.GUILD_NEWS;

  /**
   * Subscribes a channel to cross-post messages from this channel.
   * @param {string | GuildTextChannel} channel The channel to cross-post to.
   * @returns {FollowedChannel} The follow result.
   */
  public async follow(
    channel: string | GuildTextChannel
  ): Promise<FollowedChannel> {
    const data = await this.client.api.post<APIFollowedChannel>(
      `/channels/${this.id}/followers`,
      {
        body: {
          webhook_channel_id:
            channel instanceof GuildTextChannel ? channel.id : channel,
        },
      }
    );

    return {
      channelId: data.channel_id,
      webhookId: data.webhook_id,
    };
  }

  /**
   * Cross-posts a message in this channel.
   * @param {string | Message} message The message to crosspost.
   * @returns {Promise<Message>} The cross-posted message.
   */
  public async crosspost(message: string | Message): Promise<Message> {
    const id = message instanceof Message ? message.id : message;

    const data = await this.client.api.post(
      `/channels/${this.id}/messages/${id}/crosspost`
    );
    return this.messages["_add"](data);
  }

  /**
   * Modifies this news channel.
   * @param {ModifyGuildChannel} data The data to modify the channel with.
   * @param {string} [reason] The reason to provide.
   */
  public async modify(
    data: ModifyGuildTextChannel,
    reason?: string
  ): Promise<this> {
    return super.modify(
      {
        name: data.name,
        position: data.position,
        permissionOverwrites: data.permissionOverwrites,
        topic: data.topic,
        type: data.type,
        nsfw: data.nsfw,
        parent_id:
          data.parent instanceof CategoryChannel ? data.parent.id : data.parent,
      },
      reason
    );
  }
}

export interface FollowedChannel {
  channelId: string;
  webhookId: string;
}
