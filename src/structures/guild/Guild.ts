/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Snowflake } from "@neocord/utils";
import { Base } from "../Base";
import { neo } from "../Extender";
import {
  BanManager,
  GuildChannelManager,
  MemberManager,
  PresenceManager,
  RoleManager,
  VoiceStateManager,
} from "../../managers";
import { DiscordStructure } from "../../util";

import type { Shard } from "@neocord/gateway";
import type {
  APIGuild,
  APIVoiceRegion,
  GuildExplicitContentFilter,
  GuildFeature,
  GuildPremiumTier,
  GuildSystemChannelFlags,
  GuildVerificationLevel,
  RESTGetAPIGuildVanityUrlResult,
} from "discord-api-types/default";
import type { WelcomeScreen } from "./welcome/WelcomeScreen";
import type { Client } from "../../lib";
import type { Member } from "./Member";
import type { ImageURLOptions } from "@neocord/rest";

export class Guild extends Base {
  public readonly structureType = DiscordStructure.Guild;

  /**
   * The ID of this guild.
   * @type {string}
   */
  public readonly id: string;

  /**
   * The shard that this guild operates on.
   * @type {Shard}
   */
  public readonly shard: Shard;

  /**
   * All cached roles for this guild.
   * @type {RoleManager}
   */
  public readonly roles: RoleManager;

  /**
   * All presences for this guild.
   * @type {PresenceManager}
   */
  public readonly presences: PresenceManager;

  /**
   * All cached voice states for this guild.
   * @type {VoiceStateManager}
   */
  public readonly voiceStates: VoiceStateManager;

  /**
   * All cached channels for this guild.
   * @type {GuildChannelManager}
   */
  public readonly channels: GuildChannelManager;

  /**
   * All cached members for this guild.
   * @type {MemberManager}
   */
  public readonly members: MemberManager;

  /**
   * All cached bans for this guild.
   * @type {BanManager}
   */
  public readonly bans: BanManager;

  /**
   * Whether this guild has been deleted from the cache.
   * @type {boolean}
   */
  public deleted = false;

  /**
   * The name of this guild.
   * @type {string}
   */
  public name!: string;

  /**
   * The ID of the AFK Voice Channel.
   * @type {string | null}
   */
  public afkChannelId!: string | null;

  /**
   * AFK Timeout in seconds.
   * @type {number | null}
   */
  public afkTimeout!: number | null;

  /**
   * Approximate number of members in this guild.
   * @type {number | null}
   */
  public approximateMemberCount!: number | null;

  /**
   * Approximate number of non-offline members in this guild.
   * @type {number | null}
   */
  public approximatePresenceCount!: number | null;

  /**
   * The hash of the guild banner,
   * @type {string | null}
   */
  public banner!: string | null;

  /**
   * The description of this guild, if the guild is discoverable.
   * @type {string | null}
   */
  public description!: string | null;

  /**
   * The discovery splash hash, only for guilds that are discoverable.
   * @type {string | null}
   */
  public discoverySplash!: string | null;

  /**
   * The explicit content filter config.
   * @type {GuildExplicitContentFilter}
   */
  public contentFilter!: GuildExplicitContentFilter;

  /**
   * Enabled guild features.
   * @type {Array<GuildFeature>}
   */
  public features!: GuildFeature[];

  /**
   * Timestamp for when the client joined the guild.
   * @type {number | null}
   */
  public joinedTimestamp!: number | null;

  /**
   * Whether this guild is considered a large guild.
   * @type {boolean}
   */
  public large!: boolean;

  /**
   * The maximum number of members allowed in this guild.
   * @type {number}
   */
  public maxMembers?: number;

  /**
   * The maximum number of presences for this guild.
   * @type {number}
   */
  public maxPresences?: number;

  /**
   * The maximum amount of users in a video channel
   * @type {number | null}
   */
  public maxVideoChannelUsers!: number | null;

  /**
   * Total number of members in this guild
   * @type {number | null}
   */
  public memberCount!: number | null;

  /**
   * The ID of the user who owns this guild.
   * @type {string}
   */
  public ownerId!: string;

  /**
   * The preferred locale of a guild with the PUBLIC feature, defaults to "en-US".
   * @type {string}
   */
  public preferredLocale!: string;

  /**
   * The number of boosts this guild currently has.
   * @type {number}
   */
  public boostCount!: number;

  /**
   * The current boost tier of this guild.
   * @type {GuildPremiumTier}
   */
  public boostTier!: GuildPremiumTier;

  /**
   * The ID of the channel where admins/moderators of guilds with the PUBLIC feature will receives notices from Discord.
   * @type {string | null}
   */
  public updatesChannelId!: string | null;

  /**
   * The voice region of this guild.
   * @type {string}
   */
  public region!: string;

  /**
   * The ID of the channel where guilds with the PUBLIC feature can display rules and/or guidelines.
   * @type {string | null}
   */
  public rulesChannelId!: string | null;

  /**
   * System channel flags.
   * @type {GuildSystemChannelFlags}
   */
  public systemChannelFlags!: GuildSystemChannelFlags;

  /**
   * The id of the channel where guild notices such as welcome messages and boost events are posted.
   * @type {string | null}
   */
  public systemChannelId!: string | null;

  /**
   * The vanity invite code for this server.
   * @type {string | null}
   */
  public vanityURLCode!: string | null;

  /**
   * Verification level required for this guild.
   * @type {GuildVerificationLevel}
   */
  public verificationLevel!: GuildVerificationLevel;

  /**
   * The icon hash.
   * @type {string | null}
   */
  public icon!: string | null;

  /**
   * The welcome screen, only for community servers.
   * @type {WelcomeScreen}
   */
  public welcomeScreen?: WelcomeScreen;

  /**
   * Whether this guild is unavailable or not.
   * @type {boolean}
   */
  public unavailable!: boolean;

  /**
   * Creates a new instance of Guild.
   * @param {Client} client
   * @param {APIGuild} data
   */
  public constructor(client: Client, data: APIGuild) {
    super(client);

    this.id = data.id;

    const shardId =
      Snowflake.deconstruct(data.id).timestamp % client.ws.shards.size;
    this.shard = this.client.ws.shards.get(shardId) as Shard;

    this.roles = new RoleManager(this);
    this.voiceStates = new VoiceStateManager(this);
    this.channels = new GuildChannelManager(this);
    this.members = new MemberManager(this);
    this.bans = new BanManager(this);
    this.presences = new PresenceManager(this);

    this._patch(data);
  }

  /**
   * The client as a member of this guild.
   * @type {Member}
   */
  public get me(): Member {
    return this.members.get(this.client.user?.id as string) as Member;
  }

  /**
   * Get the icon URL of this guild.
   * @param {ImageURLOptions} [options] The URL options.
   * @returns {?string} Returns the URL of the guild icon, if any.
   */
  public iconURL(options?: ImageURLOptions): string | null {
    return this.icon
      ? this.client.api.cdn.guildIcon(this.id, this.icon, options)
      : null;
  }

  /**
   * Make the current user leave this guild.
   * @returns {Promise<Guild>} This guild.
   */
  public async leave(): Promise<Readonly<Guild>> {
    await this.client.guilds.leave(this);
    return Object.freeze(this);
  }

  /**
   * The list of voice regions for this guild.
   * @returns {Promise<Array<APIVoiceRegion>>} The voice regions for this guild.
   */
  public fetchRegions(): Promise<APIVoiceRegion[]> {
    return this.client.api.get(`/guilds/${this.id}/regions`);
  }

  /**
   * Fetches this guilds vanity url if it's enabled.
   * @returns {Promise<RESTGetAPIGuildVanityUrlResult>} This guilds vanity url.
   */
  public fetchVanityUrl(): Promise<RESTGetAPIGuildVanityUrlResult> {
    return this.client.api.get(`/guilds/${this.id}/vanity-url`);
  }

  /**
   * Deletes this guild. Current user must be the owner.
   * @returns {Promise<Readonly<Guild>>} This guild.
   */
  public async delete(): Promise<Readonly<Guild>> {
    await this.client.guilds.remove(this);
    return Object.freeze(this);
  }

  /**
   * The string representation of this guild.
   * @returns {string} The name of the guild.
   */
  public toString(): string {
    return this.name;
  }

  /**
   * Updates this guild with data from the api.
   * @protected
   */
  protected _patch(data: APIGuild): this {
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

    this.systemChannelId = data.system_channel_id;

    this.vanityURLCode = data.vanity_url_code;

    this.verificationLevel = data.verification_level;

    this.icon = data.icon;

    this.unavailable = data.unavailable ?? false;

    if (data.welcome_screen) {
      if (!this.welcomeScreen) {
        const welcomeScreen = new (neo.get("WelcomeScreen"))(
          this,
          data.welcome_screen
        );

        this.welcomeScreen = welcomeScreen;
      } else this.welcomeScreen["_patch"](data.welcome_screen);
    }

    if (data.roles) {
      this.roles.clear();
      for (const role of data.roles) this.roles["_add"](role);
    }

    if (data.presences) {
      for (const presence of data.presences) this.presences["_add"](presence);
    }

    if (data.members) {
      this.members.clear();
      for (const member of data.members) this.members["_add"](member);
    }

    if (data.channels) {
      this.channels.clear();
      for (const channel of data.channels)
        this.client.channels["_add"](channel, this);
    }

    if (data.voice_states) {
      this.voiceStates.clear();
      for (const voiceState of data.voice_states)
        this.voiceStates["_add"](voiceState);
    }

    return this;
  }
}
