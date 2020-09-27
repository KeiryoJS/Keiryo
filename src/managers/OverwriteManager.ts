/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { BaseManager } from "./BaseManager";
import { neo } from "../structures";
import { DiscordStructure, PermissionResolvable, Permissions } from "../util";
import { Member } from "../structures/guild/Member";

import type { Role } from "../structures/guild/Role";
import type { PermissionOverwrite } from "../structures/guild/PermissionOverwrite";
import type { GuildChannel } from "../structures/channel/guild/GuildChannel";
import type { Guild } from "../structures/guild/Guild";
import type { APIOverwrite } from "discord-api-types";

export class OverwriteManager extends BaseManager<PermissionOverwrite> {
  /**
   * The channel this overwrite manager belongs to.
   * @type {GuildChannel}
   */
  readonly #channel: GuildChannel;

  /**
   * Creates a new instanceof OverwriteManager.
   * @param {GuildChannel} channel The guild channel this manager belongs to.
   */
  public constructor(channel: GuildChannel) {
    super(channel.client, {
      class: neo.get("PermissionOverwrite"),
      structure: DiscordStructure.Overwrite,
    });

    this.#channel = channel;
  }

  /**
   * The channel that this manager belongs to.
   * @type {GuildChannel}
   */
  public get channel(): GuildChannel {
    return this.#channel;
  }

  /**
   * The guild the channel belongs to.
   * @type {Guild}
   */
  public get guild(): Guild {
    return this.#channel.guild;
  }

  /**
   * Adds a new permission overwrite to this channel.
   * @param {Member} target The overwrite target, either a guild role or member.
   * @param {OverwriteOptions} options Options for the overwrite.
   */
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

    return this._add({
      id,
      ...body,
    } as APIOverwrite);
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

  /**
   * Get the overwrites for a role or member.
   * @param {Role | Member} target
   * @returns {RoleOverwrites | MemberOverwrites}
   */
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
