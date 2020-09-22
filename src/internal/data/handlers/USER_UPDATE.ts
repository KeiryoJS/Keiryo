/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Handler } from "../Handler";
import { neo } from "../../../structures/Extender";

import type { GatewayUserUpdateDispatch } from "discord-api-types/default";
import type { User } from "../../../structures/other/User";

export default class USER_UPDATE extends Handler<GatewayUserUpdateDispatch> {
  public handle(data: GatewayUserUpdateDispatch): number {
    let user = this.client.users.get(data.d.id) ?? null;
    if (user) {
      const old = user.clone();
      user["_patch"](data.d);
      return this.client.emit(this.clientEvent, user, old);
    }

    user = new (neo.get("User"))(this.client, data.d);
    this.client.users["_set"](user as User);
    return this.client.emit(this.clientEvent, user);
  }
}
