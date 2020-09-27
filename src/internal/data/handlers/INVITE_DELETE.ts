/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Handler } from "../Handler";
import MESSAGE_DELETE from "./message/MESSAGE_DELETE";
import { Channel } from "../../../structures/channel/Channel";

import type { GatewayInviteDeleteDispatch } from "discord-api-types";

export default class INVITE_DELETE extends Handler<
  GatewayInviteDeleteDispatch
> {
  public handle(data: GatewayInviteDeleteDispatch): void {
    const channel = MESSAGE_DELETE.getChannel(
      this.client,
      data.d.channel_id,
      data.d.guild_id
    );
    if (!channel || !Channel.isGuildBased(channel)) return;

    const invite = channel.invites.get(data.d.code);
    if (invite) {
      channel.invites["_delete"](invite.code);
      this.client.invites.cache.delete(invite.code);
      this.client.emit(this.clientEvent, invite);
    }

    return;
  }
}
