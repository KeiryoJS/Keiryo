/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ResourcePool } from "../../abstract/ResourcePool";
import { resources } from "../../resource/Resources";

export class GuildIntegrationPool extends ResourcePool {
  /**
   * @param {Guild} guild The guild instance.
   */
  constructor(guild) {
    super(guild.client, {
      limit: guild.client.caching.limitFor("integration"),
      class: resources.get("Integration")
    });

    /**
     * The guild that this integration pool belongs to.
     * @type {Guild}
     * @readonly
     */
    Object.defineProperty(this, "guild", {
      value: guild,
      configurable: false,
      writable: false
    });
  }
}
