/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Handler } from "../../Handler";

import type { GatewayGuildUpdateDispatch } from "discord-api-types";

export default class GUILD_UPDATE extends Handler {
  public handle(data: GatewayGuildUpdateDispatch): void | number {
    const guild = this.client.guilds.get(data.d.id);
    if (guild) {
      const old = guild.clone();
      const updated = guild["_patch"](data.d);
      return this.client.emit(this.clientEvent, updated, old);
    }

    this.client.guilds["_add"](data.d);
  }
}