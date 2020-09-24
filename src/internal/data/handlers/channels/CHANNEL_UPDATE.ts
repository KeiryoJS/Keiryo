/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Handler } from "../../Handler";
import {
  Channel,
  GuildBasedChannel,
  TextBasedChannel,
} from "../../../../structures/channel/Channel";
import MESSAGE_DELETE from "../message/MESSAGE_DELETE";

import type { GatewayChannelUpdateDispatch } from "discord-api-types";
import type { GuildChannel } from "../../../../structures/channel/guild/GuildChannel";

export default class CHANNEL_UPDATE extends Handler<
  GatewayChannelUpdateDispatch
> {
  public handle(data: GatewayChannelUpdateDispatch): void {
    const channel = MESSAGE_DELETE.getChannel(
      this.client,
      data.d.id,
      data.d.guild_id
    );
    if (channel) {
      const old = channel._clone();
      const _new = Channel.create(
        this.client,
        data.d,
        (channel as GuildBasedChannel).guild
      ) as Channel;

      if (Channel.isTextable(old))
        for (const [id, message] of old.messages) {
          (_new as TextBasedChannel).messages.cache.set(id, message);
        }

      if (Channel.isGuildBased(old))
        old.guild.channels.cache.set(old.id, _new as GuildChannel);

      this.client.channels.cache.set(old.id, _new);
      this.client.emit(this.clientEvent, old, _new);
    }
  }
}
