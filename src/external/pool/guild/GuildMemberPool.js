/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ResourcePool } from "../../abstract/ResourcePool";
import { resources } from "../../resource/Resources";

export class GuildMemberPool extends ResourcePool {
  /**
   * @param {Guild} guild The guild instance.
   */
  constructor(guild) {
    super(guild.client, {
      limit: guild.client.caching.limitFor("guildMember"),
      class: resources.get("GuildMember")
    });

    /**
     * The guild that this guild member pool belongs to.
     * @type {Guild}
     * @readonly
     */
    Object.defineProperty(this, "guild", {
      value: guild,
      configurable: false,
      writable: false
    });
  }

  /**
   * Creates a new guild member.
   * @param {Object} data Guild member data.
   * @param {...*} args Arguments that will be passed to the constructor.
   * @return {Resource}
   */
  _create(data, ...args) {
    return super._create(data, this.guild, ...args);
  }
}
