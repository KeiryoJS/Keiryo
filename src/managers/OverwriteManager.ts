/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { BaseManager } from "./BaseManager";
import { neo } from "../structures";
import { PermissionResolvable, Permissions } from "../util";

import { Member } from "../structures/guild/Member";
import type { Role } from "../structures/guild/Role";
import type { PermissionOverwrite } from "../structures/guild/PermissionOverwrite";
import type { GuildChannel } from "../structures/channel/guild/GuildChannel";
import type { Guild } from "../structures/guild/Guild";
import type { RequiredExcept } from "./message/MessageBuilder";
import type { APIOverwrite } from "discord-api-types";

export class OverwriteManager extends BaseManager<PermissionOverwrite> {
  /**
   * The channel this overwrite manager belongs to.
   */
  public readonly channel: GuildChannel;

  /**
   * Creates a new instanceof OverwriteManager.
   * @param {GuildChannel} channel The guild channel this manager belongs to.
   */
  public constructor(channel: GuildChannel) {
    super(channel.client, neo.get("PermissionOverwrite"));

    this.channel = channel;
  }

  /**
   * The guild the channel belongs to.
   */
  public get guild(): Guild {
    return this.channel.guild;
  }

  /**
   * The total amount of permission overwrites that can be cached at one point in time.
   */
  public get limit(): number {
    return Infinity;
  }

  /**
   * Adds a new permission overwrite to the channel permissions.
   * @param {string} id The member or role.
   * @param {OverwriteOptions} options The overwrite options.
   */
  public add(
    id: string,
    options: RequiredExcept<OverwriteOptions, "reason">
  ): Promise<PermissionOverwrite>;

  /**
   * Adds a new permission overwrite to the channel permissions.
   * @param {Role} target The role.
   * @param {OverwriteOptions} options The overwrite options.
   */
  public add(
    target: Role,
    options: Omit<OverwriteOptions, "type">
  ): Promise<PermissionOverwrite>;

  /**
   * Adds a new permission overwrite to the channel permissions.
   * @param {Member} target The member.
   * @param {OverwriteOptions} options The overwrite options.
   */
  public add(
    target: Member,
    options: Omit<OverwriteOptions, "type">
  ): Promise<PermissionOverwrite>;

  public async add(
    target: Member | Role | string,
    options: OverwriteOptions
  ): Promise<PermissionOverwrite> {
    const body = {
      type: options.type ?? "member",
      allow: Permissions.resolve(options.allow),
      deny: Permissions.resolve(options.deny),
    };

    let id: string | null;
    if (typeof target === "string") id = target;
    else {
      id = this.guild.members.resolveId(target);
      if (!id) {
        id = this.guild.roles.resolveId(target);
        body.type = "member";
      }
    }

    if (!id) throw new Error("Cannot find the target.");

    await this.client.api.put(`${this.channel.endpoint}/permissions/${id}`, {
      body,
    });

    return this._add({ id, ...body } as APIOverwrite);
  }

  /**
   * Get the overwrites for a guild member.
   * @param {Member} member The member
   */
  public for(member: Member): MemberOverwrites;

  /**
   * Get the overwrites for a role.
   * @param {Role} role The role.
   * @returns {RoleOverwrites}
   */
  public for(role: Role): RoleOverwrites;

  public for(target: Member | Role): MemberOverwrites | RoleOverwrites {
    const everyone = this.get(this.channel.guild.id);

    if (target instanceof Member) {
      const member = this.get(target.id),
        roles: PermissionOverwrite[] = [];

      for (const overwrite of this.values())
        if (target.roles.has(overwrite.id)) roles.push(overwrite);

      return { member, roles, everyone };
    }

    return { everyone, role: this.get(target.id) };
  }

  /**
   * Adds a new permission overwrite to this manager.
   * @private
   */
  protected _add(data: APIOverwrite): PermissionOverwrite {
    const existing = this.get(data.id);
    if (existing) return existing["_patch"](data);
    return this._set(new this._item(this.client, data, this.channel));
  }
}

export interface OverwriteOptions {
  type?: "role" | "member";
  allow: PermissionResolvable;
  deny: PermissionResolvable;
  reason?: string;
}

export interface MemberOverwrites {
  everyone?: PermissionOverwrite;
  member?: PermissionOverwrite;
  roles: PermissionOverwrite[];
}

export interface RoleOverwrites {
  everyone?: PermissionOverwrite;
  role?: PermissionOverwrite;
}
