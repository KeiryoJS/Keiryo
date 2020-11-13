/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../../abstract/Resource";

export class Guild extends Resource {
  /**
   * @param {Client} client The client instance.
   * @param {Object} data The guild data.
   */
  constructor(client, data) {
    super(client);

    /**
     * The ID of this guild.
     * @type {string}
     */
    this.id = data.id;

    this._patch(data);
  }

  _patch(data) {
    this.name = data.name;

    this.afkChannelId = data.afk_channel_id;

    this.afkTimeout = data.afk_timeout;

    this.approximateMemberCount = data.approximate_member_count ?? null;

    this.approximatePresenceCount = data.approximate_presence_count ?? null;

    this.banner = data.banner;

    this.description = data.description;

    this.discoverySplash = data.discovery_splash;

    this.contentFilter = data.explicit_content_filter;

    this.features = data.features;

    this.joinedTimestamp = data.joined_at ? Date.parse(data.joined_at) : null;

    this.large = data.large ?? false;

    this.maxMembers = data.max_members;

    this.maxPresences =
      data.max_presences === null ? 25000 : data.max_presences;

    this.maxVideoChannelUsers = data.max_video_channel_users ?? null;

    this.memberCount = data.member_count ?? null;

    this.ownerId = data.owner_id;

    this.preferredLocale = data.preferred_locale;

    this.boostCount = data.premium_subscription_count ?? 0;

    this.boostTier = data.premium_tier;

    this.updatesChannelId = data.public_updates_channel_id;

    this.region = data.region;

    this.rulesChannelId = data.rules_channel_id;


    this.systemChannelFlags = data.system_channel_flags;

    /**
     * The id of the channel where guild notices such as welcome messages and boost events are posted.
     * @type {?string}
     */
    this.systemChannelId = data.system_channel_id;

    /**
     * The vanity url code for the guild
     * @type {?string}
     */
    this.vanityURLCode = data.vanity_url_code;

    /**
     * Verification level required for the guild.
     * @type {number}
     */
    this.verificationLevel = data.verification_level;

    /**
     * The icon hash for this guild.
     * @type {string}
     */
    this.icon = data.icon;

    /**
     * True if this guild is unavailable due to an outage.
     * @type {boolean}
     */
    this.unavailable = data.unavailable ?? false;
  }
}