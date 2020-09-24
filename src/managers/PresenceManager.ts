/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { BaseManager } from "./BaseManager";
import { neo } from "../structures";
import { DiscordStructure } from "../util";

import type { Presence } from "../structures/guild/Presence";
import type { Guild } from "../structures/guild/Guild";

export class PresenceManager extends BaseManager<Presence> {
  /**
   * The guild this manager belongs to.
   * @type {Guild}
   */
  public readonly guild: Guild;

  /**
   * Creates a new instanceof PresenceManager.
   * @param {Guild} guild The guild this manager belongs to.
   */
  public constructor(guild: Guild) {
    super(guild.client, {
      structure: DiscordStructure.Presence,
      class: neo.get("Presence"),
    });

    this.guild = guild;
  }
}
