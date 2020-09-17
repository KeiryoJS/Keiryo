/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { BaseResolvable, BaseManager } from "./BaseManager";
import { neo } from "../structures/Extender";

import type { Guild } from "../structures/guild/Guild";
import type { Client } from "../lib";

export class GuildManager extends BaseManager<Guild> {
  /**
   * Creates a new instanceof GuildManager.
   * @param {Client} client The client instance.
   */
  public constructor(client: Client) {
    super(client, neo.get("Guild"));
  }

  /**
   * The total amount of guilds that can be cached at one time.
   * @returns {number}
   */
  public get limit(): number {
    return Infinity; // TODO: get guild limit from the client.
  }

  /**
   * Removes a guild from the current users guild list.
   * @param {BaseResolvable} guild The guild to remove.
   * @param {string} [reason] The reason to provide.
   * @returns {Guild | null} The guild that was removed.
   */
  public async remove(
    guild: BaseResolvable<Guild>,
    reason?: string
  ): Promise<Guild | null> {
    const g = this.resolve(guild);
    if (g) await this.client.api.delete(`/guilds/${g.id}`, { reason });
    return g;
  }

  /**
   * Fetches a guild from the discord api.
   * @param {string} guild The ID of the guild to fetch.
   * @returns {Promise<Guild>} The fetched guild.
   */
  public async fetch(guild: string): Promise<Guild> {
    const data = await this.client.api.get(`/guilds/${guild}`, {
      query: { with_counts: "true" },
    });

    return this._add(data);
  }
}
