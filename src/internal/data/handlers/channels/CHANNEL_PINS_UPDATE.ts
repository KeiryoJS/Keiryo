/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Handler } from "../../Handler";
import MESSAGE_DELETE from "../message/MESSAGE_DELETE";
import { Channel } from "../../../../structures/channel/Channel";

import type { GatewayChannelPinsUpdateDispatch } from "discord-api-types";

export default class CHANNEL_PINS_UPDATE extends Handler<
  GatewayChannelPinsUpdateDispatch
> {
  private static getTime(t?: string): Date | null {
    if (!t) return null;
    const date = new Date(t);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  public handle(data: GatewayChannelPinsUpdateDispatch): void {
    const channel = MESSAGE_DELETE.getChannel(
      this.client,
      data.d.channel_id,
      data.d.guild_id
    );
    if (!channel || !Channel.isTextable(channel)) return;

    const time = CHANNEL_PINS_UPDATE.getTime(data.d.last_pin_timestamp);
    channel.lastPinTimestamp = time?.getTime() ?? null;
    this.client.emit(this.clientEvent, channel, time);
  }
}
