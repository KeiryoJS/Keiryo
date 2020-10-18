/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Permission, Permissions } from "@neocord/utils";
import { Resource, ResourceLike, ResourceType } from "../../../abstract";
import { exclude, UncachedResourceError } from "../../../../utils";

import { GuildMemberRoles } from "../../../pool/proxy/GuildMemberRoles";

import type { APIGuildMember } from "discord-api-types";
import type { Client } from "../../../../client";
import type { Guild } from "../Guild";
import type { VoiceState } from "./VoiceState";
import type { User } from "../../user/User";
import type { RoleLike } from "../../../pool/guild/GuildRolePool";
import type { VoiceChannel } from "../../channel/guild/VoiceChannel";
import type { GuildChannel } from "../../channel/guild/GuildChannel";

export class GuildMember extends Resource {
  /**
   * The ID of this guild member.
   *
   * @type {string}
   */
  public readonly id: string;

  /**
   * The guild this member belongs to.
   *
   * @type {Guild}
   */
  public readonly guild: Guild;

  /**
   * The roles that this member has.
   *
   * @type {GuildMemberRoles}
   */
  public readonly roles: GuildMemberRoles;

  /**
   * This users guild nickname.
   *
   * @type {string | null}
   */
  public nickname!: string | null;

  /**
   * When the user joined the guild.
   *
   * @type {number}
   */
  public joinedTimestamp!: number;

  /**
   * When the user started boosting the guild.
   *
   * @type {number | null}
   */
  public boostedTimestamp!: number | null;

  /**
   * Whether the user is muted in voice channels.
   *
   * @type {boolean}
   */
  public deaf!: boolean;

  /**
   * Whether the user is deafened in voice channels.
   *
   * @type {boolean}
   */
  public mute!: boolean;

  /**
   * Whether this member has been deleted.
   *
   * @type {boolean}
   */
  public deleted = false;

  /**
   * @param {Client} client The client instance.
   * @param {APIGuildMember} data The guild member data.
   * @param guild
   */
  public constructor(client: Client, data: APIGuildMember, guild: Guild) {
    super(client);

    this.id = data.user?.id as string;
    if (data.user) {
      client.users["_add"](data.user);
    }

    this.guild = guild;
    this.roles = new GuildMemberRoles(this);

    this._patch(data);
  }

  /**
   * The {@link VoiceState voice state} of this member.
   * @type {VoiceState | null}
   */
  public get voice(): VoiceState | null {
    return this.guild.voiceStates.cache.get(this.id) ?? null;
  }

  /**
   * The mention string for this member.
   *
   * @type {string}
   */
  public get mention(): string {
    return `<@${this.nickname ? "!" : ""}${this.id}>`;
  }

  /**
   * The calculated permissions from the member's roles.
   *
   * @type {Permissions}
   */
  public get permissions(): Permissions {
    if (this.id === this.guild.ownerId) {
      return new Permissions(Permissions.ALL).freeze();
    }

    const perms = new Permissions(this.roles.cache.map((r) => r.permissions));
    if (perms.has(Permission.Administrator)) {
      perms.add(Permissions.ALL);
    }

    return perms.freeze();
  }

  /**
   * The user that this guild member represents.
   *
   * @type {User}
   */
  public get user(): User {
    const user = this.client.users.cache.get(this.id);
    if (!user) {
      throw new UncachedResourceError(ResourceType.User, `ID: ${this.id}`);
    }

    return user;
  }

  /**
   * Edits this member
   * @param {MemberUpdateData} data The data to update the member with.
   * @param {string} [reason] The reason for editing this member.
   * @returns {Promise<this>}
   */
  public async edit(data: MemberUpdateData, reason?: string): Promise<this> {
    await this.client.rest.patch(`/guilds/${this.guild.id}/members/${this.id}`, {
      reason,
      body: {
        ...exclude(data, "channel", "roles"),
        channel_id: data.channel
          ? this.guild.channels.resolveId(data.channel)
          : data.channel,
        roles: (data.roles ?? []).map((r) => this.guild.roles.resolveId(r))
      }
    });

    return this;
  }

  /**
   * Checks permissions for this member in a given channel.
   * @param {GuildChannel} channel The guild channel.
   * @param {boolean} [guildScope]
   *
   * @type {Readonly<Permissions>}
   */
  public permissionsIn(
    channel: GuildChannel,
    guildScope = true
  ): Readonly<Permissions> {
    const { permissions } = this;

    if (permissions.equals(Permissions.ALL)) return permissions;

    const guildScopePermissions = guildScope
      ? permissions.mask(Permissions.GUILD_SCOPE_PERMISSIONS)
      : 0;
    const overwrites = channel.overwrites.for(this);

    return permissions
      .remove(overwrites.everyone ? overwrites.everyone.deny : 0)
      .add(overwrites.everyone ? overwrites.everyone.allow : 0)
      .remove(
        overwrites.roles.length > 0
          ? overwrites.roles.map((role) => role.deny)
          : 0
      )
      .add(
        overwrites.roles.length > 0
          ? overwrites.roles.map((role) => role.allow)
          : 0
      )
      .remove(overwrites.member ? overwrites.member.deny : 0)
      .add(overwrites.member ? overwrites.member.allow : 0)
      .add(guildScopePermissions)
      .freeze();
  }

  /**
   * The string representation of this member.
   *
   * @type {string}
   */
  public toString(): string {
    return this.mention;
  }

  /**
   * Updates this guild member with data from Discord.
   * @param {APIGuildMember} data
   *
   * @protected
   */
  protected _patch(data: APIGuildMember): this {
    this.nickname = data.nick;
    this.joinedTimestamp = Date.parse(data.joined_at);
    this.deaf = data.deaf;
    this.mute = data.mute;
    this.boostedTimestamp = data.premium_since
      ? Date.parse(data.premium_since)
      : null;

    return this;
  }
}

export interface MemberUpdateData {
  /**
   * Array of roles the member is assigned.
   *
   * @type {RoleLike[]}
   */
  roles?: RoleLike[];

  /**
   * Value to set users nickname to.
   *
   * @type {?string}
   */
  nick?: string | null;

  /**
   * Whether the user is deafened in voice channels.
   *
   * @type {boolean}
   */
  deaf?: boolean;

  /**
   * Whether the user is muted in voice channels.
   *
   * @type {boolean}
   */
  mute?: boolean;

  /**
   * ID of channel to move user to (if they are connected to voice)
   *
   * @type {ResourceLike<VoiceChannel>}
   */
  channel?: ResourceLike<VoiceChannel> | null;
}

