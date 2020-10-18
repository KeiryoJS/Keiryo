/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ResourceProxy } from "../../abstract/ResourceProxy";

import type { Role } from "../../resource/guild/member/Role";
import type { GuildMember } from "../../resource/guild/member/GuildMember";
import type { Guild } from "../../resource/guild/Guild";
import type { RoleLike } from "../guild/GuildRolePool";

export class GuildMemberRoles extends ResourceProxy<Role> {
  /**
   * The guild member that this pool belongs to.
   *
   * @type {GuildMember}
   * @private
   */
  readonly #member: GuildMember;

  /**
   * @param {GuildMember} member The member instance.
   */
  public constructor(member: GuildMember) {
    super(member.guild.roles);

    this.#member = member;
  }

  /**
   * The guild that the member belongs to.
   *
   * @type {Guild}
   */
  public get guild(): Guild {
    return this.member.guild;
  }

  /**
   * The guild member that this pool belongs to.
   *
   * @type {GuildMember}
   */
  public get member(): GuildMember {
    return this.#member;
  }

  /**
   * Add a role to the member.
   * @param {RoleLike} role The role to add.
   * @param {string} [reason] The reason for adding this role.
   *
   * @returns {Promise<GuildMemberRoles>}
   */
  public async add(role: RoleLike, reason?: string): Promise<this> {
    const adding = this.resolveId(role);
    if (adding) {
      await this.client.rest.put(
        `/guilds/${this.guild.id}/members/${this.member.id}/roles/${adding}`,
        { reason }
      );

      return this;
    }

    throw new Error(`Couldn't resolve an ID from ${role}`);
  }

  /**
   * Remove a role from the member.
   * @param {RoleLike} role The role to remove.
   * @param {string} [reason] The reason for removing this role.
   *
   * @returns {Promise<GuildMemberRoles>}
   */
  public async remove(role: RoleLike, reason?: string): Promise<this> {
    const removing = this.resolveId(role);
    if (removing) {
      await this.client.rest.delete(
        `/guilds/${this.guild.id}/members/${this.member.id}/roles/${removing}`,
        { reason }
      );

      return this;
    }

    throw new Error(`Couldn't resolve an ID from ${role}`);
  }
}