import { APIFollowedChannel, ChannelType } from "discord-api-types";
import { TextChannel } from "./TextChannel";

import type { Message } from "../../message/Message";

export class NewsChannel extends TextChannel {
  public readonly type = ChannelType.GUILD_NEWS;

  /**
   * Subscribes a channel to cross-post messages from this channel.
   * @param {string | TextChannel} channel The channel to cross-post to.
   *
   * @returns {FollowedChannel} The follow result.
   */
  public async follow(channel: string | TextChannel): Promise<FollowedChannel> {
    const data = await this.client.rest.post<APIFollowedChannel>(
      `/channels/${this.id}/followers`,
      {
        body: {
          webhook_channel_id:
            channel instanceof TextChannel ? channel.id : channel
        }
      }
    );

    return {
      channelId: data.channel_id,
      webhookId: data.webhook_id
    };
  }

  /**
   * Cross-posts a message in this channel.
   * @param {string | Message} message The message to crosspost.
   *
   * @returns {Promise<Message>} The cross-posted message.
   */
  public async crosspost(message: string | Message): Promise<Message> {
    const id = this.messages.resolveId(message),
      data = await this.client.rest.post(`/channels/${this.id}/messages/${id}/crosspost`);

    return this.messages["_add"](data);
  }
}

export interface FollowedChannel {
  /**
   * ID of the channel.
   */
  channelId: string;

  /**
   * ID of the webhook.
   */
  webhookId: string;
}

