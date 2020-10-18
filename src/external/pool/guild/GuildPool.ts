/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ResourceLike, ResourcePool, ResourceType } from "../../abstract";
import { resources } from "../../resource/Resources";

import type { Guild } from "../../resource/guild/Guild";
import type { Client } from "../../../client";

export class GuildPool extends ResourcePool<Guild> {
  /**
   * @param {Client} client The client instance.
   */
  public constructor(client: Client) {
    super(client, {
      resource: ResourceType.Guild,
      class: resources.get("Guild")
    });
  }

  /**
   * Deletes the guild. Current user must be the owner.
   * @param {GuildLike} guild The guild to remove.
   *
   * @returns {Promise<GuildLike>} The guild that was removed.
   */
  public async remove<G extends GuildLike>(guild: G): Promise<G | null> {
    const id = this.resolveId(guild);
    if (id) {
      await this.client.rest.delete(`/guilds/${id}`);
      return guild;
    }

    throw new Error("Couldn't resolve a guild id.");
  }

  /**
   * Leaves a guild.
   * @param {GuildLike} guild The guild to leave.
   *
   * @returns {Promise<GuildLike>} The guild that the current user left.
   */
  public async leave<G extends GuildLike>(guild: G): Promise<G | null> {
    const id = this.resolveId(guild);
    if (!id) {
      await this.client.rest.delete(`/users/@me/guilds/${id}`);
      return guild;
    }

    throw new Error("Couldn't resolve a guild id.");
  }

  /**
   * Fetches a guild from the discord api.
   * @param {string} guild The ID of the guild to fetch.
   * @param {boolean} [force] Whether to check if the guild is already cached.
   *
   * @returns {Promise<Guild>} The fetched guild.
   */
  public async fetch(guild: string, force?: boolean): Promise<Guild> {
    if (!force) {
      const cached = this.cache.get(guild);
      if (cached) return cached;
    }

    const data = await this.client.rest.get(`/guilds/${guild}`, {
      query: {
        with_counts: true
      }
    });

    return this._add(data);
  }
}

export type GuildLike = ResourceLike<Guild>;
