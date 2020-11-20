/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ResourcePool } from "../../abstract/ResourcePool";
import { resources } from "../../resource/Resources";

export class GuildPool extends ResourcePool {
  /**
   * @param {Client} client The client instance.
   */
  constructor(client) {
    super(client, {
      limit: client.caching.limitFor("guild"),
      class: resources.get("Guild")
    });
  }

  /**
   * Deletes the guild. Current user must be the owner.
   * @param {Guild | string} guild The guild to remove.
   * @returns {Promise<Guild | string>} The guild that was removed.
   */
  async remove(guild) {
    const id = this.resolveId(guild);
    if (id) {
      await this.client.rest.queue({
        method: "delete",
        endpoint: `/guilds/${id}`
      });

      return guild;
    }

    throw new Error(`Couldn't resolve a guild from: ${guild}`);
  }

  /**
   * Leaves a guild.
   * @param {Guild | string} guild The guild to leave.
   * @return {Promise<Guild | string>} The provided guild.
   */
  async leave(guild) {
    const id = this.resolveId(guild);
    if (id) {
      await this.client.rest.queue({
        method: "delete",
        endpoint: `/users/@me/guilds/${id}`
      });

      return guild;
    }

    throw new Error(`Couldn't resolve a guild from: ${guild}`);
  }

  /**
   * Fetches a guild from the Discord API.
   * @param {string} id ID of the guild to fetch.
   * @param {GuildFetchOptions} [options={}] The fetch options.
   * @returns {Promise<Guild>}
   */
  async fetch(id, { force, cache } = { force: false, cache: true }) {
    if (!force && this.has(id)) {
      return this.get(id);
    }

    const data = await this.client.rest.queue({
      endpoint: `/guilds/${id}`,
      query: { with_counts: true }
    });

    return cache ? this.add(data) : this._create(data);
  }
}

/**
 * @typedef {Object} GuildFetchOptions
 * @prop {boolean} [force=false] Whether to force fetch the guild.
 * @prop {boolean} {cache=true} Whether to cache the fetched guild.
 */
