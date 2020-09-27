/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Handler } from "../../../Handler";
import type { GatewayGuildBanAddDispatch } from "discord-api-types";

export default class GUILD_BAN_ADD extends Handler<GatewayGuildBanAddDispatch> {
  public handle(data: GatewayGuildBanAddDispatch): void {
    const guild = this.client.guilds.get(data.d.guild_id);
    if (!guild) return;
    this.client.emit(this.clientEvent, guild.bans["_add"](data.d, guild));
  }
}
