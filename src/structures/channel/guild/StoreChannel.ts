/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { GuildChannel } from "./GuildChannel";
import { ChannelType } from "discord-api-types";
import { DiscordStructure } from "../../../util";

export class StoreChannel extends GuildChannel {
  public readonly structureType = DiscordStructure.GuildChannel;

  /**
   * The type of channel.
   * @type {ChannelType.GUILD_STORE}
   */
  public readonly type = ChannelType.GUILD_STORE;
}
