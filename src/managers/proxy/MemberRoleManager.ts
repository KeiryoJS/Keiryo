/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ProxyManager } from "../ProxyManager";

import type { Role } from "../../structures/guild/Role";
import type { Member } from "../../structures/guild/Member";
import type { Guild } from "../../structures/guild/Guild";
import type { RoleResolvable } from "../RoleManager";

export class MemberRoleManager extends ProxyManager<Role> {
  /**
   * The member this role manager belongs to.
   * @type {Member}
   */
  public readonly member: Member;

  /**
   * Creates a new instanceof MemberRoleManager.
   * @param {Member} member The member this manager belongs to.
   * @param {Array<string>} [roles] The roles.
   */
  public constructor(member: Member, roles?: string[]) {
    super(member.guild.roles, roles);

    this.member = member;
  }

  /**
   * The guild the channel belongs to.
   * @type {Guild}
   */
  public get guild(): Guild {
    return this.member.guild;
  }

  /**
   * Adds a role to the member.
   * @param {RoleResolvable} role
   * @param {string} [reason]
   */
  public async add(role: RoleResolvable, reason?: string): Promise<this> {
    const toAdd = this.guild.roles.resolveId(role);
    if (toAdd) {
      await this.client.api.put(
        `/guilds/${this.guild.id}/members/${this.member.id}/roles/${toAdd}`,
        {
          reason,
        }
      );
    }

    return this;
  }

  /**
   * Removes a role from the member.
   * @param {RoleResolvable} role
   * @param {string} [reason]
   */
  public async remove(role: RoleResolvable, reason?: string): Promise<this> {
    const toAdd = this.guild.roles.resolveId(role);
    if (toAdd) {
      await this.client.api.delete(
        `/guilds/${this.guild.id}/members/${this.member.id}/roles/${toAdd}`,
        {
          reason,
        }
      );
    }

    return this;
  }
}
