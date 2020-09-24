/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Handler } from "../../Handler";

import type { GatewayInviteDeleteDispatch } from "discord-api-types";

export default class INVITE_DELETE extends Handler<
  GatewayInviteDeleteDispatch
> {
  public handle(data: GatewayInviteDeleteDispatch): void {
    return void data;
  }
}
