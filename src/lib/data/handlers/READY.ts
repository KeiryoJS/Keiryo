/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Handler } from "../Handler";
import { ClientUser } from "../../../structures/other/ClientUser";

import type { GatewayReadyDispatch } from "discord-api-types/default";

export default class READY extends Handler<GatewayReadyDispatch> {
  public handle(data: GatewayReadyDispatch): void {
    this.client.user = new ClientUser(this.client, data.d.user);
    for (const guild of data.d.guilds) this.client.guilds["_add"](guild);
    this.client.users.set(this.client.user.id, this.client.user);
  }
}
