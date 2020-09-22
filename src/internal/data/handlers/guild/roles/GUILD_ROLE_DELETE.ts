/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Handler } from "../../../Handler";
import { ClientEvent } from "../../../../../util";

import type { GatewayGuildRoleDeleteDispatch } from "discord-api-types";

export default class GUILD_ROLE_DELETE extends Handler<
  GatewayGuildRoleDeleteDispatch
> {
  public handle(pk: GatewayGuildRoleDeleteDispatch): number | void {
    const guild = this.client.guilds.get(pk.d.guild_id);
    if (guild) {
      const role = guild.roles.get(pk.d.role_id);
      if (role) {
        role.deleted = true;
        guild.roles.delete(role.id);
        this.client.emit(ClientEvent.RoleDelete, role);
      }
    }

    return;
  }
}
