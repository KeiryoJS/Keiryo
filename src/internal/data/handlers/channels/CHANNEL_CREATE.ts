/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Handler } from "../../Handler";

import type { GatewayChannelCreateDispatch } from "discord-api-types";

export default class CHANNEL_CREATE extends Handler<
  GatewayChannelCreateDispatch
> {
  public handle(data: GatewayChannelCreateDispatch): void {
    const channel = this.client.channels["_add"](data.d);
    this.client.emit(this.clientEvent, channel);
  }
}
