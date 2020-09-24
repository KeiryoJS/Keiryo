/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { BaseManager, BaseResolvable } from "./BaseManager";
import { neo } from "../structures";
import { DiscordStructure } from "../util";

import type { Guild } from "../structures/guild/Guild";
import type { Client } from "../internal";

export class GuildManager extends BaseManager<Guild> {
  /**
   * Creates a new instanceof GuildManager.
   * @param {Client} client The client instance.
   */
  public constructor(client: Client) {
    super(client, {
      class: neo.get("Guild"),
      structure: DiscordStructure.Guild,
    });
  }

  /**
   * Deletes this guild. Current user must be the owner.
   * @param {BaseResolvable} guild The guild to remove.
   * @returns {Guild | null} The guild that was removed.
   */
  public async remove(guild: GuildResolvable): Promise<Guild | null> {
    const g = this.resolve(guild);
    if (g) await this.client.api.delete(`/guilds/${g.id}`);
    return g;
  }

  /**
   * Leaves a guild.
   * @param {GuildResolvable} guild The guild to leave.
   * @returns {?Guild} The guild that the current user left.
   */
  public async leave(guild: GuildResolvable): Promise<Guild | null> {
    const g = this.resolve(guild);
    if (g) {
      await this.client.api.delete(`/users/@me/guilds/${g.id}`);
      return g;
    }

    return null;
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

export type GuildResolvable = BaseResolvable<Guild>;
