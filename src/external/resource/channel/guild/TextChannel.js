/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ImageResolver } from "../../../../utils";
import { GuildChannel } from "./GuildChannel";

export class TextChannel extends GuildChannel {
  /**
   * @param {Guild} guild
   * @param {Object} data
   */
  constructor(guild, data) {
    super(guild, data);

    this._patch(data);
  }

  _patch(data) {
    /**
     * The topic of the text channel
     * @type {?string}
     */
    this.topic = data.topic;

    /**
     * Wheather the channel is a NSFW channel
     * @type {boolean}
     * @readonly
     */
    this.nsfw = Boolean(data.nsfw);

    /**
     * The ID of the last message send in this channel
     * @type {?string}
     */
    this.lastMessageID = data.last_message_id;

    /**
     * The ratelimit per user for this channel in seconds
     * @type {number}
     */
    this.rateLimitPerUser = data.rate_limit_per_user ?? 0;

    /**
     * The timestamp when the last pinned message was pinned, if there was one
     * @type {?number}
     */
    this.lastPinTimestamp = data.last_pin_timestamp
      ? new Date(data.last_pin_timestamp).getTime()
      : null;
  }

  /**
   * Sets the rate limit per user for this channel
   * @param {number} rateLimitPerUser
   * @param {string} [reason]
   */
  setRateLimitPerUser(rateLimitPerUser, reason) {
    return this.edit({ rateLimitPerUser }, reason);
  }

  /**
   * Sets wheather this channel is flagged as NSFW
   * @param {boolean} nsfw
   * @param {string} [reason]
   */
  setNSFW(nsfw, reason) {
    return this.edit({ nsfw }, reason);
  }

  /**
   * Creates a webhook for this channel
   * @param {string} name
   * @param {Object} [options]
   * @param {ImageResolvable} [options.avatar]
   * @param {string} [options.reason]
   */
  async createWebhook(name, { avatar, reason } = {}) {
    return this.client.rest.post(`/channels/${this.id}/webhooks`, {
      data: {
        name,
        avatar:
          typeof avatar === "string"
            ? await ImageResolver.resolveImage(avatar)
            : avatar,
      },
      reason,
    });
  }
}
