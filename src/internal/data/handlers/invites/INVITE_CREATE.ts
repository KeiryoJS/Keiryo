/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Handler } from "../../Handler";

import type { GatewayInviteCreateDispatch } from "discord-api-types";

export default class INVITE_CREATE extends Handler<
  GatewayInviteCreateDispatch
> {
  public handle(data: GatewayInviteCreateDispatch): void {
    return void data;
  }
}
