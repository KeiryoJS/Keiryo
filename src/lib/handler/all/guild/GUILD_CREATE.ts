/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Handler } from "../../Handler";
import { ClientEvent } from "../../../../util";

import type { GatewayGuildCreateDispatch } from "discord-api-types/default";

export default class GUILD_CREATE extends Handler<GatewayGuildCreateDispatch> {
  public handle(data: GatewayGuildCreateDispatch): number | void {
    let guild = this.client.guilds.get(data.d.id);
    if (!guild) {
      guild = this.client.guilds["_add"](data.d);
      return this.client.emit(this.clientEvent, guild);
    }

    const unavailable = guild.unavailable;
    guild["_patch"](data.d);
    if (unavailable && !guild.unavailable)
      this.client.emit(ClientEvent.GuildAvailable, guild);
  }
}
