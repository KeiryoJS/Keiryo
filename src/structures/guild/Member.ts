/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Base } from "../Base";
import {
  BanOptions,
  BaseResolvable,
  MemberRoleManager,
  RoleResolvable,
} from "../../managers";
import { exclude, Permission, Permissions } from "../../util";

import type { APIGuildMember } from "discord-api-types/default";
import type { User } from "../other/User";
import type { GuildChannel } from "../channel/guild/GuildChannel";
import type { VoiceChannel } from "../channel/guild/VoiceChannel";
import type { Guild } from "./Guild";
import type { VoiceState } from "./VoiceState";
import type { Presence } from "./Presence";
import type { Client } from "../../internal";

export class Member extends Base {
  /**
   * The ID of this member.
   * @type {string}
   */
  public readonly id: string;

  /**
   * The guild this member belongs to.
   * @type {Guild}
   */
  public readonly guild: Guild;

  /**
   * The roles that belong to this member.
   * @type {MemberRoleManager}
   */
  public readonly roles: MemberRoleManager;

  /**
   * This users guild nickname.
   * @type {string | null}
   */
  public nickname!: string | null;

  /**
   * When the user joined the guild.
   * @type {number}
   */
  public joinedTimestamp!: number;

  /**
   * When the user started boosting the guild.
   * @type {number | null}
   */
  public boostedTimestamp!: number | null;

  /**
   * Whether the user is muted in voice channels.
   * @type {boolean}
   */
  public deaf!: boolean;

  /**
   * Whether the user is deafened in voice channels.
   * @type {boolean}
   */
  public mute!: boolean;

  /**
   * Whether this member has been deleted.
   * @type {boolean}
   */
  public deleted = false;

  /**
   * Creates a new instanceof Member
   * @param {Client} client
   * @param {APIGuildMember} data
   * @param {string} guild The guild that this role belongs to.
   */
  public constructor(client: Client, data: APIGuildMember, guild: Guild) {
    super(client);

    this.guild = guild;
    this.id = data.user?.id as string;
    this.roles = new MemberRoleManager(this);
  }

  /**
   * The presence of this member.
   * @type {Presence | null}
   */
  public get presence(): Presence | null {
    return this.guild.presences.get(this.id) ?? null;
  }

  /**
   * The user that this guild member represents.
   * @type {User}
   */
  public get user(): User {
    return this.client.users.get(this.id) as User;
  }

  /**
   * The calculated permissions from the member's roles.
   * @type {Permissions}
   */
  public get permissions(): Permissions {
    if (this.id === this.guild.ownerId)
      return new Permissions(Permissions.ALL).freeze();

    const perms = new Permissions(this.roles.map((r) => r.permissions));
    if (perms.has(Permission.Administrator)) perms.add(Permissions.ALL);

    return perms.freeze();
  }

  /**
   * The displayed name for this guild member.
   * @type {string}
   */
  public get displayName(): string {
    return this.nickname ?? this.user.username;
  }

  /**
   * The {@link VoiceState voice state} of this member.
   * @type {VoiceState | null}
   */
  public get voice(): VoiceState | null {
    return this.guild.voiceStates.get(this.id) ?? null;
  }

  /**
   * The mention string for this member.
   * @type {string}
   */
  public get mention(): string {
    return `<@${this.nickname ? "!" : ""}${this.id}>`;
  }

  /**
   * Whether the current user can ban this member.
   * @type {boolean}
   */
  public get bannable(): boolean {
    return (
      this.manageable && this.guild.me.permissions.has(Permission.BanMembers)
    );
  }

  /**
   * Whether the current user can ban this member.
   * @type {boolean}
   */
  public get kickable(): boolean {
    return (
      this.manageable && this.guild.me.permissions.has(Permission.KickMembers)
    );
  }

  /**
   * Whether the current user can manage this member.
   * @type {boolean}
   */
  public get manageable(): boolean {
    const me = this.guild.me;

    // If the current user is the guild owner, then it can manage itself.
    if (this.guild.ownerId === me.id) return true;

    // If this member is owner, then the current user cannot manage it.
    if (this.guild.ownerId === this.id) return false;

    const highest = this.roles.highest;
    const meHighest = me.roles.highest;
    return !highest || !meHighest
      ? false
      : meHighest.position > highest.position;
  }

  /**
   * The string representation of this member.
   * @type {string}
   */
  public toString(): string {
    return this.mention;
  }

  /**
   * Checks permissions for this member in a given channel.
   * @param {GuildChannel} channel The guild channel.
   * @param {boolean} [guildScope]
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
   * Kicks this member from the {@link Guild guild}.
   * @param {string} [reason] The audit-log reason.
   * @returns {Promise<Member>}
   */
  public async kick(reason?: string): Promise<Readonly<Member>> {
    const mem = await this.guild.members.kick(this, reason);
    return mem as Readonly<Member>;
  }

  /**
   * Bans this member from the {@link Guild guild}.
   * @param {BanOptions} [options] The options for the {@link Ban ban}.
   * @returns {Promise<Member>}
   */
  public async ban(options?: BanOptions): Promise<Readonly<Member>> {
    await this.guild.bans.add(this, options);
    return Object.freeze(this);
  }

  /**
   * Edits this member
   * @param {MemberUpdateData} data The data to update the member with.
   * @param {string} [reason] The reason for editing this member.
   * @returns {Promise<this>}
   */
  public async edit(data: MemberUpdateData, reason?: string): Promise<this> {
    await this.client.api.patch(`/guilds/${this.guild.id}/members/${this.id}`, {
      reason,
      body: {
        ...exclude(data, "channel", "roles"),
        channel_id: data.channel
          ? this.guild.channels.resolveId(data.channel)
          : data.channel,
        roles: (data.roles ?? []).map((r) => this.guild.roles.resolveId(r)),
      },
    });

    return this;
  }

  /**
   * Fetches this member from the api.
   * @param {boolean} [force] Whether to skip the cache check.
   * @returns {Promise<Member>}
   */
  public fetch(force?: boolean): Promise<Member> {
    return this.guild.members.fetch(this.id, force);
  }

  /**
   * Updates this guild member from the discord gateway/api.
   * @param {APIGuildMember} data
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

    if (data.roles) {
      for (const role of data.roles) {
        this.roles["_set"](role);
      }
    }

    return this;
  }
}

export interface MemberUpdateData {
  /**
   * Array of roles the member is assigned.
   * @type {RoleResolvable[]}
   */
  roles?: RoleResolvable[];

  /**
   * Value to set users nickname to.
   * @type {?string}
   */
  nick?: string | null;

  /**
   * Whether the user is deafened in voice channels.
   * @type {boolean}
   */
  deaf?: boolean;

  /**
   * Whether the user is muted in voice channels.
   * @type {boolean}
   */
  mute?: boolean;

  /**
   * ID of channel to move user to (if they are connected to voice)
   * @type {BaseResolvable<VoiceChannel>}
   */
  channel?: BaseResolvable<VoiceChannel> | null;
}
