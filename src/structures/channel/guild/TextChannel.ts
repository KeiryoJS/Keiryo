/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { APIChannel, ChannelType } from "discord-api-types";
import { Duration } from "@neocord/utils";
import { GuildTextChannel, ModifyGuildTextChannel } from "./GuildTextChannel";
import { CategoryChannel } from "./CategoryChannel";
import { DiscordStructure } from "../../../util";

const MAX_RATE_LIMIT = 21600;

export class TextChannel extends GuildTextChannel {
  public readonly structureType = DiscordStructure.GuildChannel;

  /**
   * The type of text channel.
   * @type {ChannelType.GUILD_TEXT}
   */
  public readonly type = ChannelType.GUILD_TEXT;

  /**
   * Amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission ManageMessages or ManageChannel, are unaffected.
   * Or null if there isn't a configured ratelimit.
   * @type {number}
   */
  public ratelimit!: number | null;

  /**
   * Modifies this text channel.
   * @param {ModifyGuildChannel} data The data to modify the channel with.
   * @param {string} [reason] The reason to provide.
   */
  public async modify(data: ModifyTextChannel, reason?: string): Promise<this> {
    let ratelimit =
      typeof data.userRatelimit === "string"
        ? Duration.parse(data.userRatelimit)
        : data.userRatelimit;

    if (ratelimit) {
      ratelimit = Math.abs(ratelimit);
      if (ratelimit > MAX_RATE_LIMIT) {
        throw new Error(
          `Rate-limit must not be above ${MAX_RATE_LIMIT} (or ${Duration.parse(
            MAX_RATE_LIMIT,
            true
          )}).`
        );
      }
    }

    return super.modify(
      {
        name: data.name,
        position: data.position,
        permissionOverwrites: data.permissionOverwrites,
        topic: data.topic,
        type: data.type,
        nsfw: data.nsfw,
        rate_limit_per_user: ratelimit,
        parent_id:
          data.parent instanceof CategoryChannel ? data.parent.id : data.parent,
      },
      reason
    );
  }

  /**
   * Updates this text channel with data from Discord.
   * @param {APIChannel} data
   * @protected
   */
  protected _patch(data: APIChannel): this {
    this.ratelimit = data.rate_limit_per_user ?? null;

    return super._patch(data);
  }
}

export interface ModifyTextChannel extends ModifyGuildTextChannel {
  userRatelimit?: number | string | null;
}
