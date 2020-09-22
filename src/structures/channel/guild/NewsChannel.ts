/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { APIFollowedChannel, ChannelType } from "discord-api-types";
import { Message } from "../../message/Message";
import { TextChannel } from "./TextChannel";

export class NewsChannel extends TextChannel {
  /**
   * The type of this channel.
   * @type {ChannelType.GUILD_NEWS}
   */
  public readonly type = ChannelType.GUILD_NEWS;

  /**
   * Subscribes a channel to cross-post messages from this channel.
   * @param {string | TextChannel} channel The channel to cross-post to.
   * @returns {FollowedChannel} The follow result.
   */
  public async follow(channel: string | TextChannel): Promise<FollowedChannel> {
    const data = await this.client.api.post<APIFollowedChannel>(
      `/channels/${this.id}/followers`,
      {
        body: {
          webhook_channel_id:
            channel instanceof TextChannel ? channel.id : channel,
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
}

export interface FollowedChannel {
  channelId: string;
  webhookId: string;
}
