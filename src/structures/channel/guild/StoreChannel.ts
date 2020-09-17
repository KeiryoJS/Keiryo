/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { GuildChannel } from "./GuildChannel";
import { ChannelType } from "discord-api-types";

export class StoreChannel extends GuildChannel {
  /**
   * The type of channel.
   */
  public readonly type = ChannelType.GUILD_STORE;
}
