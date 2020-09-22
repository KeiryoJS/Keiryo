/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { BaseManager } from "./BaseManager";
import { neo } from "../structures";

import type { Presence } from "../structures/guild/Presence";
import type { Guild } from "../structures/guild/Guild";
import type { GatewayPresenceUpdate } from "discord-api-types";
import { DiscordStructure } from "../util";

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
    super(guild.client, neo.get("Presence"));

    this.guild = guild;
  }

  /**
   * The amount of presences that can be cached at one time.
   * @type {number}
   */
  public limit(): number {
    return this.client.data.limits.get(DiscordStructure.Presence) ?? Infinity;
  }

  /**
   * Adds a new presence to this manager
   * @private
   */
  protected _add(data: GatewayPresenceUpdate): Presence {
    const existing = this.get(data.user.id);
    if (existing) existing["_patch"](data);
    return this._set(new this._item(this.client, data, this.guild));
  }
}
