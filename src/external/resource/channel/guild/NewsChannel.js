/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Snowflake } from "@neocord/utils";
import { TextChannel } from "./TextChannel";

export class NewsChannel extends TextChannel {
  /**
   * @param {Guild} guild
   * @param {Object} data
   */
  constructor(guild, data) {
    super(guild);

    this._patch(data);
  }

  _patch(data) {
    this.rateLimitPerUser = undefined;
  }

  /**
   * Adds the target to this channel's followers
   * @param {string} channel
   * @param {string} [reason]
   */
  async addFollower(channel, reason) {
    const channelID = Snowflake.deconstruct(channel);
    if (!channelID) throw new Error("RESOLVE_GUILD_CHANNEL");
    await this.client.rest.post(`/channels/${this.id}/followers`, {
      data: { webhook_channel_id: channelID },
      reason,
    });
    return this;
  }
}
