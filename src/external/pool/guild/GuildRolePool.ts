/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ResourcePool, ResourceType } from "../../abstract";
import { resources } from "../../resource/Resources";

import type { Role } from "../../resource/guild/member/Role";
import type { Guild } from "../../resource/guild/Guild";

export class GuildRolePool extends ResourcePool<Role> {
  /**
   * The guild that this pool belongs to.
   *
   * @type {Guild}
   * @private
   */
  readonly #guild: Guild;

  /**
   * @param {Guild} guild The guild instance.
   */
  public constructor(guild: Guild) {
    super(guild.client, {
      class: resources.get("Role"),
      resource: ResourceType.Role
    });

    this.#guild = guild;
  }

  /**
   * The guild that this pool belongs to.
   *
   * @type {Guild}
   */
  public get guild(): Guild {
    return this.#guild;
  }
}
