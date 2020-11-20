/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ResourcePool } from "../../abstract/ResourcePool";
import { resources } from "../../resource/Resources";
import { Collection } from "../../../utils";

export class GuildBanPool extends ResourcePool {
  /**
   * @param {Guild} guild The guild instance.
   */
  constructor(guild) {
    super(guild.client, {
      limit: guild.client.caching.limitFor("ban"),
      class: resources.get("Ban")
    });

    /**
     * The guild that this role pool belongs to.
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
   * Resolves something into a ban.
   * @param {Ban | User | string} resl Can either be a Ban, a User, or a string.
   * @return {Ban | null}
   */
  resolve(resl) {
    let ban = super.resolve(resl);
    if (!ban) {
      const user = this.client.users.resolveId(resl);
      if (user && this.has(user)) {
        ban = this.get(user);
      }
    }

    return ban ?? null;
  }

  /**
   * Resolves something into an ID.
   * @param {Ban | User | string} resl The resource like.
   * @return {string | null}
   */
  resolveId(resl) {
    let id = super.resolveId(resl);
    if (!id && this.client.users._matches(resl)) {
      id = resl.id;
    }

    return id;
  }

  /**
   * Removes a ban (unbans the user).
   * @param {Ban | User | string} ban The user/user id of the ban to remove or the ban itself.
   * @param {string} [reason] Reason for removing the ban.
   * @return {Promise<boolean>}
   */
  async remove(ban, reason) {
    const id = this.resolveId(ban);
    if (id) {
      await this.client.rest.delete(`/guilds/${this.guild.id}/bans/${id}`, {
        reason
      });

      return true;
    }

    throw new Error("Couldn't resolve a User ID from the provided value.");
  }

  /**
   * Creates a new User Ban.
   * @prop {User | GuildMember | string} The user this ban targets.
   * @prop {BanOptions} [options] The options for this ban.
   * @returns {User | GuildMember | string}
   */
  async create(user, options = {}) {
    const id = this.guild.members.resolveId(user);
    if (!id) {
      throw new Error("Provide a valid User, GuildMember, or User ID.");
    }

    await this.client.rest.put(`/guilds/${this.guild.id}/bans/${id}`, {
      data: options
    });

    return user;
  }

  /**
   * Fetches a ban or bans from
   * @param {FetchBans} options Fetch options.
   * @return {Promise<GuildBanPool | Collection | Ban>}
   */
  async fetch({ force = false, ...options }) {
    const cache = options.cache ?? true;
    if (options.id) {
      if (!force && this.has(options.id)) {
        return this.get(options.id);
      }

      const data = await this.client.rest.queue({
        endpoint: `/guilds/${this.guild.id}/bans/${options.id}`
      });

      return cache ? this.add(data) : this._create(data);
    }

    const bans = await this.client.rest.get(`/guilds/${this.guild.id}/bans`),
      col = cache ? this : new Collection();

    for (const ban of bans) {
      col.set(ban.id, this._create(ban));
    }

    return col;
  }
}

/**
 * @typedef {Object} BanCreateOptions
 * @prop {string} [reason] Reason for the ban.
 * @prop {number} [days=7] Numbers of days to delete messages for (0-7)
 */

/**
 * @typedef {Object} FetchBans
 * @prop {string} [id] ID of the ban to fetch.
 * @prop {boolean} [cache=true] Whether to cache the fetch ban(s).
 * @prop {boolean} [force=false] (Single Ban) Whether to force fetch instead of checking if the ban is already cached.
 */
