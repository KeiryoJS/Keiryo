/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Handler } from "../../Handler";
import MESSAGE_DELETE from "./MESSAGE_DELETE";
import { Channel } from "../../../../structures/channel/Channel";

import type { GatewayMessageDeleteBulkDispatch } from "discord-api-types";
import type { Message } from "../../../../structures/message/Message";

export default class MESSAGE_DELETE_BULK extends Handler<
  GatewayMessageDeleteBulkDispatch
> {
  public handle(
    data: GatewayMessageDeleteBulkDispatch
  ): Promise<unknown> | unknown {
    const channel = MESSAGE_DELETE.getChannel(
      this.client,
      data.d.channel_id,
      data.d.guild_id
    );
    if (!channel || !Channel.isTextable(channel)) return;

    const messages: ({ id: string } | Readonly<Message>)[] = [];
    for (const id of data.d.ids) {
      const message = channel.messages.get(id);
      if (message) {
        message.deleted = true;
        channel.messages.cache.delete(id);
        messages.push(message._freeze());
      } else messages.push({ id });
    }

    this.client.emit(this.clientEvent, messages, channel);
  }
}
