/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Handler } from "../Handler";
import type { APIUser, GatewayPresenceUpdateDispatch } from "discord-api-types";

export default class PRESENCE_UPDATE extends Handler<
  GatewayPresenceUpdateDispatch
> {
  public handle(data: GatewayPresenceUpdateDispatch): void {
    let user = this.client.users.get(data.d.user.id);
    if (!user) {
      user = data.d.user.username
        ? this.client.users["_add"](data.d.user)
        : undefined;
    }

    if (!user) return;

    const guild = data.d.guild_id
      ? this.client.guilds.get(data.d.guild_id)
      : null;

    if (!guild) return;

    const old = guild.presences.get(user.id)?._clone() ?? null;
    if (data.d.status && data.d.status !== "offline") {
      // @ts-expect-error
      guild.members["_add"]({
        user: data.d.user as Required<APIUser>,
        roles: data.d.roles ?? [],
        deaf: false,
        mute: false,
      });
    }

    const presence = guild.presences["_add"](data.d);
    this.client.emit(this.clientEvent, old, presence);
  }
}
