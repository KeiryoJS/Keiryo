/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Handler } from "../../Handler";
import MESSAGE_DELETE from "../message/MESSAGE_DELETE";
import { Channel } from "../../../../structures/channel/Channel";
import { Typing } from "../../../../structures/other/Typing";

import type { GatewayTypingStartDispatch } from "discord-api-types";

export default class TYPING_START extends Handler<GatewayTypingStartDispatch> {
  public handle(data: GatewayTypingStartDispatch): void {
    const channel = MESSAGE_DELETE.getChannel(
      this.client,
      data.d.channel_id,
      data.d.guild_id
    );

    if (!channel) return;
    if (Channel.isGuildBased(channel) && data.d.member) {
      channel.guild.members["_add"](data.d.member, channel.guild);
    }

    const user = this.client.users.get(data.d.user_id);
    if (!user) return;

    const typing = new Typing(this.client, data.d);
    this.client.emit(this.clientEvent, channel, typing);
  }
}
