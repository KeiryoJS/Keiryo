/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ResourceProxy } from "../../abstract/ResourceProxy";

import type { Role } from "../../resource/guild/member/Role";
import type { GuildMember } from "../../resource/guild/member/GuildMember";
import type { Guild } from "../../resource/guild/Guild";

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

}