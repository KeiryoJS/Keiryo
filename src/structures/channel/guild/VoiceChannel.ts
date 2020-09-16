/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { GuildChannel } from "./GuildChannel";
import { ChannelType } from "discord-api-types";

export class VoiceChannel extends GuildChannel {
  public readonly type = ChannelType.GUILD_VOICE;

  /**
   * The bitrate (in bits) of the voice channel; 8000 to 96000 (128000 for VIP servers).
   * @type {number}
   */
  public bitrate!: number;

  /**
   * The user limit of the voice channel; 0 refers to no limit, 1 to 99 refers to a user limit.
   * @type {number}
   */
  public userLimit!: number;

  /**
   * Whether the current user can delete this voice channel.
   */
  public get deletable(): boolean {
    return !this.deleted;
  }
}
