/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Channel } from "../Channel";

export class GuildChannel extends Channel {
  /**
   * @param {Guild} guild
   * @param {Object} data
   */
  constructor(guild, data) {
    super(guild.client, data);

    /**
     * The guild the channel is in
     * @type {Guild}
     */
    this.guild = guild;
    this._patch(data);
  }

  /**
   * Edit the channel
   * @param {Object} data
   * @param {string} [reason]
   */
  async edit(data, reason) {
    const resp = await this.client.rest.patch(`/channels/${this.id}`, {
      data: {
        name: (data.name ?? this.name).trim(),
        topic: data.topic,
        nsfw: data.nsfw,
        bitrate: data.bitrate || this.bitrate,
        user_limit:
          typeof data.userLimit !== "undefined"
            ? data.userLimit
            : this.userLimit,
        parent_id: data.parentID,
        lock_permissions: data.lockPermissions,
        rate_limit_per_user: data.rateLimitPerUser,
      },
      reason,
    });

    return this._patch(resp);
  }

  /**
   * Deletes the channel
   * @param {string} [reason]
   */
  delete(reason) {
    return this.client.rest.delete(`/channels/${this.id}`, {
      data: { reason },
    });
  }

  _patch(data) {
    /**
     * The name of the guild channel
     * @type {string}
     */
    this.name = data.name;

    /**
     * The raw position of the channel from discord
     * @type {number}
     */
    this.rawPosition = data.position;

    /**
     * The ID of the category parent for this channel
     * @type {?string}
     */
    this.parentID = data.parent_id ?? null;
  }
}
