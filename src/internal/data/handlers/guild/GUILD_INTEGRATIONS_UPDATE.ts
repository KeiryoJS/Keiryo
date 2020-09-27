/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Handler } from "../../Handler";

import type { GatewayGuildIntegrationsUpdateDispatch } from "discord-api-types";

export default class GUILD_INTEGRATIONS_UPDATE extends Handler<
  GatewayGuildIntegrationsUpdateDispatch
> {
  public handle(
    data: GatewayGuildIntegrationsUpdateDispatch
  ): Promise<unknown> | unknown {
    const guild = this.client.guilds.get(data.d.guild_id);
    if (!guild) return;
    this.client.emit(this.clientEvent, guild);
  }
}
