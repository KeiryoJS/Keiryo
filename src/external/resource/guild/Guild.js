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

  /**
   * Updates this guild.
   * @param {Object} data
   */
  _patch(data) {
    /**
     * This guilds name.
     * @type {string}
     */
    this.name = data.name;

    /**
     * The voice channel ID you are moved to when the guild marks you as AFK.
     * @type {?number}
     */
    this.afkChannelID = data.afk_channel_id;

    /**
     * The amount of time until the guild marks you as AFK in a voice channel.
     * @type {?number}
     */
    this.afkTimeout = data.afk_timeout;

    /**
     * About how many members are in this guild.
     * @type {?number}
     */
    this.approximateMemberCount = data.approximate_member_count ?? null;

    /**
     * About how many presences there are in this guild.
     * @type {?number}
     */
    this.approximatePresenceCount = data.approximate_presence_count ?? null;

    /**
     * The banner hash of this guild
     * @type {?string}
     */
    this.banner = data.banner ?? null;

    /**
     * The description of the guild
     * @type {?string}
     */
    this.description = data.description ?? null;

    /**
     * The discovery splash hash.
     * @type {?string}
     */
    this.discoverySplash = data.discovery_splash ?? null;

    /**
     * The content filter level of this guild.
     * @type {number}
     */
    this.contentFilter = data.explicit_content_filter ?? 0;

    /**
     * The features this guild has.
     * @type {string[]}
     */
    this.features = data.features ?? [];

    /**
     * The date that the guild was joined at
     * @type {?number}
     */
    this.joinedTimestamp = data.joined_at ? Date.parse(data.joined_at) : null;

    /**
     * If the guild exceeds the largeThreshold amount
     * @type {number}
     */
    this.large = data.large ?? false;

    /**
     * The maxiumum amount of members
     * @type {number}
     */
    this.maxMembers = data.max_members;

    /**
     * The maximum amount of presences the bot can take
     * @type {number}
     */
    this.maxPresences =
      data.max_presences === null ? 25000 : data.max_presences;

    /**
     * The maxiumum amount of users that can share video at once
     * @type {?number}
     */
    this.maxVideoChannelUsers = data.max_video_channel_users ?? null;

    /**
     * The amount of members in this guild
     * @type {?number}
     */
    this.memberCount = data.member_count ?? null;

    /**
     * The ID of the user who owns this guild
     * @type {string}
     */
    this.ownerID = data.owner_id;

    /**
     * The locale the guild prefers
     * @type {string}
     */
    this.locale = data.preferred_locale;

    /**
     * The amount of boosts in this guild
     * @type {number}
     */
    this.boostCount = data.premium_subscription_count ?? 0;

    /**
     * The tier of the guilds boosts
     * @type {number}
     */
    this.boostTier = data.premium_tier ?? 0;

    /**
     * The channel ID of the channel discord sends community server updates to
     * @type {?string}
     */
    this.updatesChannelID = data.public_updates_channel_id;

    /**
     * The region of which this guild is located
     * @type {string}
     */
    this.region = data.region;

    /**
     * The channel ID of this guilds rule channel
     * @type {?string}
     */
    this.rulesChannelID = data.rules_channel_id;

    /**
     * The flags for the System channel
     * @type {number}
     */
    this.systemChannelFlags = data.system_channel_flags;

    /**
     * The id of the channel where guild notices such as welcome messages and boost events are posted.
     * @type {?string}
     */
    this.systemChannelID = data.system_channel_id;

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