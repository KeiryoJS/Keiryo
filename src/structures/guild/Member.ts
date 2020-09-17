/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Base } from "../Base";
import { BanOptions, MemberRoleManager } from "../../managers";
import { Permissions } from "../../util";

import type { APIGuildMember } from "discord-api-types/default";
import type { Guild } from "./Guild";
import type { User } from "../other/User";
import type { VoiceState } from "./VoiceState";
import type { GuildChannel } from "../channel/guild/GuildChannel";

export class Member extends Base {
  /**
   * The ID of this member.
   */
  public readonly id: string;

  /**
   * The guild this member belongs to.
   */
  public readonly guild: Guild;

  /**
   * The roles that belong to this member.
   */
  public readonly roles: MemberRoleManager;

  /**
   * This users guild nickname.
   */
  public nickname!: string | null;

  /**
   * When the user joined the guild.
   */
  public joinedTimestamp!: number;

  /**
   * When the user started boosting the guild.
   */
  public boostedTimestamp!: number | null;

  /**
   * Whether the user is muted in voice channels
   */
  public deaf!: boolean;

  /**
   * Whether the user is deafened in voice channels
   */
  public mute!: boolean;

  /**
   * @param guild
   * @param data
   */
  public constructor(guild: Guild, data: APIGuildMember) {
    super(guild.client);

    this.id = data.user?.id as string;
    this.guild = guild;
    this.roles = new MemberRoleManager(this);
  }

  /**
   * The user that this guild member represents.
   */
  public get user(): User {
    return this.client.users.get(this.id) as User;
  }

  /**
   * The calculated permissions from the member's roles.
   */
  public get permissions() {
    if (this.id === this.guild.ownerId)
      return new Permissions(Permissions.ALL).freeze();

    const perms = new Permissions(this.roles.map((r) => r.permissions));
    return (perms.has(Permissions.FLAGS.Administrator)
      ? perms.add(Permissions.ALL)
      : perms
    ).freeze();
  }

  /**
   * The displayed name for this guild member.
   */
  public get displayName(): string {
    return this.nickname ?? this.user.username;
  }

  /**
   * The {@link VoiceState voice state} of this member.
   */
  public get voice(): VoiceState | null {
    return this.guild.voiceStates.get(this.id) ?? null;
  }

  /**
   * The mention string for this member.
   */
  public get mention(): string {
    return `<@${this.nickname ? "!" : ""}${this.id}>`;
  }

  /**
   * The string representation of this member.
   */
  public toString(): string {
    return this.mention;
  }

  /**
   * Checks permissions for this member in a given channel.
   * @param {GuildChannel} channel The guild channel.
   * @param {boolean} [guildScope]
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
   * @returns {Member}
   */
  public async kick(reason?: string): Promise<Readonly<Member>> {
    const mem = await this.guild.members.kick(this, reason);
    return mem as Readonly<Member>;
  }

  /**
   * Bans this member from the {@link Guild guild}.
   * @param {BanOptions} [options] The options for the {@link Ban ban}.
   * @returns {Member}
   */
  public async ban(options?: BanOptions): Promise<Readonly<Member>> {
    await this.guild.bans.new(this, options);
    return Object.freeze(this);
  }

  /**
   * Updates this guild member from the discord gateway/api.
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

    if (data.roles) for (const role of data.roles) this.roles.set(role);

    return this;
  }
}
