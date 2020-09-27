/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Handler } from "../Handler";
import { Channel } from "../../../structures/channel/Channel";
import MESSAGE_DELETE from "./message/MESSAGE_DELETE";

import type { GatewayInviteCreateDispatch } from "discord-api-types";

export default class INVITE_CREATE extends Handler<
  GatewayInviteCreateDispatch
> {
  public handle(data: GatewayInviteCreateDispatch): unknown {
    const channel = MESSAGE_DELETE.getChannel(
      this.client,
      data.d.channel_id,
      data.d.guild_id
    );
    if (!channel || !Channel.isGuildBased(channel)) return;

    const invite = this.client.invites["_add"](data.d);
    channel.invites["_set"](invite.code);
    return this.client.emit(this.clientEvent, invite);
  }
}
