/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Handler } from "../../../Handler";
import { ClientEvent } from "../../../../../util";

import type { GatewayGuildRoleCreateDispatch } from "discord-api-types";

export default class GUILD_ROLE_CREATE extends Handler<
  GatewayGuildRoleCreateDispatch
> {
  public handle(pk: GatewayGuildRoleCreateDispatch): number | void {
    const guild = this.client.guilds.get(pk.d.guild_id);
    if (guild) {
      const role = guild.roles["_add"](pk.d.role);
      this.client.emit(ClientEvent.RoleCreate, role);
    }

    return;
  }
}
