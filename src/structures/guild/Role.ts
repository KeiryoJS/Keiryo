/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import {
  DiscordStructure,
  parseColor,
  PermissionResolvable,
  Permissions,
} from "../../util";
import { SnowflakeBase } from "../SnowflakeBase";

import type { APIRole, APIRoleTags } from "discord-api-types/default";
import type { Collection } from "@neocord/utils";
import type { Guild } from "./Guild";
import type { GuildChannel } from "../channel/guild/GuildChannel";
import type { MemberResolvable } from "../../managers";
import type { Member } from "./Member";
import type { Client } from "../../internal";

/**
 * Represents a Discord Role.
 * @extends {SnowflakeBase}
 */
export class Role extends SnowflakeBase {
  public readonly structureType = DiscordStructure.Role;

  /**
   * The ID of this role.
   * @type {string}
   */
  public readonly id: string;

  /**
   * The {@link Guild guild} this role belongs to.
   * @type {Guild}
   */
  public readonly guild: Guild;

  /**
   * The color that this role has.
   * @type {number}
   */
  public color!: number;

  /**
   * If this role is pinned in the user listing
   * @type {boolean}
   */
  public hoisted!: boolean;

  /**
   * Whether this role is managed by an integration
   * @type {boolean}
   */
  public managed!: boolean;

  /**
   * Whether this role is mentionable
   * @type {boolean}
   */
  public mentionable!: boolean;

  /**
   * The name of this role.
   * @type {string}
   */
  public name!: string;

  /**
   * The permissions of this role.
   * @type {Permissions}
   */
  public permissions!: Permissions;

  /**
   * The position of this role
   * @type {number}
   */
  public position!: number;

  /**
   * Tags for this role.
   * @type {APIRoleTags}
   */
  public tags!: APIRoleTags | null;

  /**
   * Whether this role has been deleted or not.
   * @type {boolean}
   */
  public deleted = false;

  /**
   * Creates a new instanceof Role.
   * @param {Client} client The client instance.
   * @param {APIRole} data Data sent from the Discord API.
   * @param {Guild} guild The guild that this role belongs to.
   */
  public constructor(client: Client, data: APIRole, guild: Guild) {
    super(client);

    this.id = data.id;
    this.guild = guild;
  }

  /**
   * Whether or not this role is @everyone
   * @type {boolean}
   */
  public get everyone(): boolean {
    return this.id === this.guild.id;
  }

  /**
   * All of the guild members that have this role.
   * @type {Collection<string, Member>}
   */
  public get members(): Collection<string, Member> {
    return this.guild.members.filter((m) => m.roles.has(this.id));
  }

  /**
   * The mention string of this role.
   * @type {string}
   */
  public get mention(): string {
    return this.everyone ? "@everyone" : `<@&${this.id}>`;
  }

  /**
   * The string representation of this role.
   * @type {string}
   */
  public toString(): string {
    return this.mention;
  }

  /**
   * Deletes the role from the guild.
   * @param {string} [reason]
   */
  public async delete(reason?: string): Promise<this> {
    await this.guild.roles.remove(this, reason);
    this.deleted = true;
    return this;
  }

  /**
   * Modifies this guild role.
   * @param {ModifyRoleData} data The data to update this role with.
   * @param {string} [reason]
   */
  public async modify(data: ModifyRoleData, reason?: string): Promise<this> {
    const body = {
      ...data,
      color: data.color ? parseColor(data.color) : data.color,
      permissions: data.permissions
        ? Permissions.resolve(data.permissions)
        : data.permissions,
    };

    const modified = await this.client.api.patch<APIRole>(
      `/guilds/${this.guild.id}/roles/${this.id}`,
      {
        body,
        reason,
      }
    );

    return this._patch(modified);
  }

  /**
   * Add this role to a guild member.
   * @param {MemberResolvable} target The target member.
   * @param {string} [reason] The reason for adding the role.
   */
  public async addTo(target: MemberResolvable, reason?: string): Promise<this> {
    const member = this.guild.members.resolve(target);
    if (member) await member.roles.remove(this, reason);
    return this;
  }

  /**
   * Remove this role to a guild member.
   * @param {MemberResolvable} target The target member.
   * @param {string} [reason] The reason for removing the role.
   */
  public async removeFrom(
    target: MemberResolvable,
    reason?: string
  ): Promise<this> {
    const member = this.guild.members.resolve(target);
    if (member) await member.roles.add(this, reason);
    return this;
  }

  /**
   * Checks permissions for this member in a given channel.
   * @param {GuildChannel} channel The channel to check permissions in.
   * @param {boolean} [guildScope] Whether to take into account guild scoped permissions, or just overwrites.
   * @returns {Permissions}
   */
  public permissionsIn(
    channel: GuildChannel,
    guildScope = true
  ): Readonly<Permissions> {
    const { permissions } = this;

    if (permissions.has(Permissions.FLAGS.Administrator))
      return new Permissions(Permissions.ALL).freeze();

    const guildScopePermissions = guildScope
      ? permissions.mask(Permissions.GUILD_SCOPE_PERMISSIONS)
      : 0;
    const overwrites = channel.overwrites.for(this);

    return permissions
      .remove(overwrites.everyone ? overwrites.everyone.deny : 0)
      .add(overwrites.everyone ? overwrites.everyone.allow : 0)
      .remove(overwrites.role ? overwrites.role.deny : 0)
      .add(overwrites.role ? overwrites.role.allow : 0)
      .add(guildScopePermissions)
      .freeze();
  }

  /**
   * Updates this role with data from the api.
   * @protected
   */
  protected _patch(data: APIRole): this {
    this.color = data.color;
    this.hoisted = data.hoist;
    this.managed = data.managed;
    this.mentionable = data.mentionable;
    this.name = data.name;
    this.position = data.position;
    this.tags = data.tags ?? null;
    this.permissions = new Permissions(data.permissions).freeze();

    return this;
  }
}

/**
 * @interface
 */
export interface ModifyRoleData {
  /**
   * Name of the role.
   */
  name?: string | null;

  /**
   * Permissions to give this role.
   */
  permissions?: PermissionResolvable | null;

  /**
   * RGB color value or hex code.
   */
  color?: number | string | null;

  /**
   * Whether the role should be displayed separately in the sidebar.
   */
  hoist?: boolean | null;

  /**
   * Whether the role should be mentionable.
   */
  mentionable?: boolean | null;
}
