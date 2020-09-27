/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Handler } from "../../../Handler";
import { neo } from "../../../../../structures";

import type { GatewayGuildBanRemoveDispatch } from "discord-api-types";

export default class GUILD_BAN_REMOVE extends Handler<
  GatewayGuildBanRemoveDispatch
> {
  public handle(data: GatewayGuildBanRemoveDispatch): unknown {
    const guild = this.client.guilds.get(data.d.guild_id);
    if (!guild) return;

    let ban = guild.bans.get(data.d.user.id);
    if (!ban) {
      ban = new (neo.get("Ban"))(this.client, data.d, guild);
    }

    this.client.emit(this.clientEvent, ban?._freeze());
  }
}
