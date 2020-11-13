/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Channel } from "../Channel";

export class GuildBasedChannel extends Channel {
  /**
   * @param {Guild} guild
   * @param {Object} data
   */
  constructor(guild, data) {
    super(guild.client);

    /**
     * The guild the channel is in
     * @type {Guild}
     */
    this.guild = guild;
    this._patch(data);
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
   * Sets a new name for the guild channel
   * @param {string} name
   * @param {string} [reason]
   */
  setName(name, reason) {
    return this.edit({ name }, reason);
  }

  /**
   * Sets the category parent of this channel
   * @param {?CategoryChannel|string} channel
   * @param {Object} [options={}]
   * @param {boolean} [options.lockPermissions=true]
   * @param {string} [options.reason]
   */
  setParent(channel, { lockPermissions = true, reason } = {}) {
    return this.edit({
      data: {
        parentID:
          channel !== null
            ? channel.hasOwnProperty("id")
              ? channel.id
              : channel
            : null,
        lockPermissions,
      },
      reason,
    });
  }

  /**
   * Sets a new topic for the guild channel
   * @param {?string} topic
   * @param {string} [reason]
   */
  setTopic(topic, reason) {
    return this.edit({ topic }, reason);
  }

  /**
   * Creates an invite to this guild channel
   * @param {Object} [options={}]
   * @param {boolean} [options.temporary=false]
   * @param {number} [options.maxAge=86400]
   * @param {number} [options.maxUses=0]
   * @param {boolean} [options.unique=false]
   * @param {string} [options.reason]
   */
  createInvite({
    temporary = false,
    maxAge = 86400,
    maxUses = 0,
    unique,
    reason,
  } = {}) {
    return this.client.rest.post(`/channels/${this.id}/invites`, {
      data: {
        temporary,
        max_age: maxAge,
        max_uses: maxUses,
        unique,
      },
      reason,
    });
  }

  /**
   * Fetches a list of invites to this guild channel
   */
  fetchInvites() {
    return this.client.rest.get(`/channels/${this.id}/invites`);
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
}
