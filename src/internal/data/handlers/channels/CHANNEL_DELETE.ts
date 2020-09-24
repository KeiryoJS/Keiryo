/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Handler } from "../../Handler";
import { Channel } from "../../../../structures/channel/Channel";

import type { GatewayChannelDeleteDispatch } from "discord-api-types";

export default class CHANNEL_DELETE extends Handler<
  GatewayChannelDeleteDispatch
> {
  public handle(data: GatewayChannelDeleteDispatch): void {
    const channel = this.client.channels.get(data.d.id);
    if (channel) {
      this.client.channels.cache.delete(channel.id);
      channel.deleted = true;

      if (Channel.isTextable(channel)) {
        for (const message of channel.messages.values()) {
          message.deleted = true;
          message._freeze();
        }
      }

      this.client.emit(this.clientEvent, channel._freeze());
    }
  }
}
