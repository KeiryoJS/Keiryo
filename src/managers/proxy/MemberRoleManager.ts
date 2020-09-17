/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ProxyManager } from "../ProxyManager";

import type { Role } from "../../structures/guild/Role";
import type { Member } from "../../structures/guild/Member";
import type { Guild } from "../../structures/guild/Guild";

export class MemberRoleManager extends ProxyManager<Role> {
  /**
   * The member this role manager belongs to.
   */
  public readonly member: Member;

  /**
   * Creates a new instanceof MemberRoleManager.
   * @param member The member this manager belongs to.
   * @param roles
   */
  public constructor(member: Member, roles?: string[]) {
    super(member.guild.roles, roles);

    this.member = member;
  }

  /**
   * The guild the channel belongs to.
   */
  public get guild(): Guild {
    return this.member.guild;
  }
}
