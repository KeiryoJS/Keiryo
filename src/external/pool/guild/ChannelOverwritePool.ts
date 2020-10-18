/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { PermissionResolvable, Permissions } from "@neocord/utils";
import { ResourcePool, ResourceType } from "../../abstract";
import { resources } from "../../resource/Resources";
import { GuildMember } from "../../resource/guild/member/GuildMember";

import type { GuildChannel } from "../../resource/channel/guild/GuildChannel";
import type { PermissionOverwrite } from "../../resource/channel/Overwrite";
import type { Guild } from "../../resource/guild/Guild";
import type { Role } from "../../resource/guild/member/Role";

export class ChannelOverwritePool extends ResourcePool<PermissionOverwrite> {
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
      class: resources.get("PermissionOverwrite"),
      resource: ResourceType.PermissionOverwrite
    });

    this.#channel = channel;
  }

  /**
   * The channel that this manager belongs to.
   *
   * @type {GuildChannel}
   */
  public get channel(): GuildChannel {
    return this.#channel;
  }

  /**
   * The guild the channel belongs to.
   *
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
    target: GuildMember | Role | string,
    options: OverwriteOptions
  ): Promise<PermissionOverwrite> {
    const body = {
      type: options.type ?? "member",
      allow: Permissions.resolve(options.allow).toString(),
      deny: Permissions.resolve(options.deny).toString()
    };

    let id: string | null;
    if (typeof target === "string") {
      id = target;
    } else {
      id = this.guild.members.resolveId(target);
      if (!id) {
        id = this.guild.roles.resolveId(target);
        body.type = "member";
      }
    }

    if (!id) {
      throw new Error("Cannot find the target.");
    }

    await this.client.rest.put(`${this.channel._ep()}/permissions/${id}`, {
      body
    });

    return this._add({
      id,
      ...body
    });
  }

  /**
   * Get the overwrites for a guild member.
   * @param {Member} member The member
   */
  public for(member: GuildMember): MemberOverwrites;

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
  public for(target: GuildMember | Role): MemberOverwrites | RoleOverwrites {
    const everyone = this.cache.get(this.channel.guild.id) as PermissionOverwrite;

    if (target instanceof GuildMember) {
      const member = this.cache.get(target.id) as PermissionOverwrite,
        roles: PermissionOverwrite[] = [];

      for (const overwrite of this.cache.values()) {
        if (target.roles.cache.has(overwrite.id)) {
          roles.push(overwrite);
        }
      }

      return { member, roles, everyone };
    }

    return {
      everyone,
      role: this.cache.get(target.id) as PermissionOverwrite
    };
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

