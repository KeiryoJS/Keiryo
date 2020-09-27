/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import type { GatewayGuildEmojisUpdateDispatch } from "discord-api-types";
import { Handler } from "../../Handler";

export default class GUILD_EMOJIS_UPDATE extends Handler<
  GatewayGuildEmojisUpdateDispatch
> {
  public handle(data: GatewayGuildEmojisUpdateDispatch): void {
    void data;
    return;
  }
}
