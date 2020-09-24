import { Handler } from "../../Handler";
import { Channel } from "../../../../structures/channel/Channel";

import type { GatewayMessageDeleteDispatch } from "discord-api-types";
import type { TextChannel } from "../../../../structures/channel/guild/TextChannel";
import type { Client } from "../../../Client";

export default class MESSAGE_DELETE extends Handler<
  GatewayMessageDeleteDispatch
> {
  /**
   * Gets a channel.
   */
  public static getChannel(
    client: Client,
    channelId: string,
    guildId?: string
  ): Channel | undefined {
    const guild = guildId ? client.guilds.get(guildId) : null;

    const channel = guild
      ? guild.channels.get<TextChannel>(channelId)
      : client.dms.get(channelId);

    return channel;
  }

  public handle(
    data: GatewayMessageDeleteDispatch
  ): Promise<unknown> | unknown {
    const channel = MESSAGE_DELETE.getChannel(
      this.client,
      data.d.channel_id,
      data.d.guild_id
    );
    if (!channel || !Channel.isTextable(channel)) return;

    const message = channel.messages.get(data.d.id);
    if (message) {
      message.deleted = true;
      channel.messages.cache.delete(message.id);
      this.client.emit(this.clientEvent, message._freeze());
    }
  }
}
