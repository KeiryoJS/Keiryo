/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Handler } from "../../../Handler";
import { ClientEvent } from "../../../../../util";

import type { GatewayGuildRoleUpdateDispatch } from "discord-api-types";

export default class GUILD_ROLE_CREATE extends Handler<
  GatewayGuildRoleUpdateDispatch
> {
  public handle(pk: GatewayGuildRoleUpdateDispatch): number | void {
    const guild = this.client.guilds.get(pk.d.guild_id);
    if (guild) {
      let role = guild.roles.get(pk.d.role.id);
      if (role) {
        const old = role.clone();
        role["_patch"](pk.d.role);
        guild.roles["_set"](role);
        return this.client.emit(ClientEvent.RoleUpdate, old, role);
      }

      role = guild.roles["_add"](pk.d.role);
      this.client.emit(ClientEvent.RoleCreate, role);
    }

    return;
  }
}
