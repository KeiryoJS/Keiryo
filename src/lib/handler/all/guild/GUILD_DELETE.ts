/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Handler } from "../../Handler";
import { ClientEvent } from "../../../../util";

import type { GatewayGuildDeleteDispatch } from "discord-api-types";

export default class GUILD_DELETE extends Handler<GatewayGuildDeleteDispatch> {
  public handle(data: GatewayGuildDeleteDispatch): unknown {
    const guild = this.client.guilds.get(data.d.id);
    if (guild) {
      if (data.d.unavailable) {
        guild.unavailable = true;
        this.client.emit(ClientEvent.GuildUnavailable, guild);
        return;
      }

      this.client.guilds.delete(guild.id);
      guild.deleted = true;
      this.client.emit(this.clientEvent, guild);
    }
  }
}