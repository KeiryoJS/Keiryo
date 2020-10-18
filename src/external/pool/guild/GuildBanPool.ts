/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Collection } from "@neocord/utils";
import { URLSearchParams } from "url";
import { ResourcePool, ResourceType } from "../../abstract";
import { resources } from "../../resource/Resources";

import type { APIBan } from "discord-api-types";
import type { Ban } from "../../resource/guild/member/Ban";
import type { Guild } from "../../resource/guild/Guild";
import type { UserLike } from "../UserPool";

export class GuildBanPool extends ResourcePool<Ban> {

  /**
   * The guild that this pool belongs to.
   *
   * @type {Guild}
   * @private
   */
  readonly #guild: Guild;

  /**
   * @param {Guild} guild The guild that this pool belongs to.
   */
  public constructor(guild: Guild) {
    super(guild.client, {
      class: resources.get("Ban"),
      resource: ResourceType.Ban
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

  /**
   * Remove a users ban.
   * @param {UserLike} user The user that is banned.
   * @param {string} [reason] The reason for removing the users ban.
   *
   * @returns {Ban}
   */
  public async remove(user: UserLike, reason?: string): Promise<boolean> {
    const ban = this.resolveId(user);
    if (ban) {
      await this.client.rest.delete(`/guilds/${this.guild.id}/bans/${ban}`, {
        reason
      });

      return true;
    }

    return false;
  }

  /**
   * Add a user ban.
   * @param {UserLike} user The user this ban is for.
   * @param {BanOptions} [options={}] The options for this ban.
   *
   * @returns {Promise<GuildBanPool>}
   */
  public async add(user: UserLike, options: BanOptions = {}): Promise<GuildBanPool> {
    const qs = new URLSearchParams();

    if (options.days) {
      qs.append("delete-message-days", options.days.toString());
    }

    if (options.reason) {
      qs.append("reason", options.reason);
    }

    const id = this.client.users.resolveId(user);
    if (id) {
      await this.client.rest.put(`/guilds/${this.guild.id}/bans/${id}`, {
        reason: options.reason,
        query: qs
      });

      return this;
    }

    throw new Error("Please provide a valid User or ID.");
  }

  /**
   * Fetches a ban from the guild.
   * @param {FetchBans} options The fetch options.
   * @param {boolean} force Whether to skip checking if the ban is already cached.
   *
   * @returns {Promise<Ban>} The fetched (or cached) {@link Ban ban}.
   */
  public fetch(options: { id: string, cache?: boolean }, force?: boolean): Promise<Ban>

  /**
   * Fetches all bans for the guild and populates a new {@link Collection collection}.
   * @param {FetchBans} options The fetch options.
   *
   * @returns {Promise<Collection<string, Ban>>} The new {@link Collection collection}.
   */
  public fetch(options: { cache: false }): Promise<Collection<string, Ban>>;

  /**
   * Fetches all bans for the guild and populates this manager.
   * @param {FetchBans} options The fetch options.
   *
   * @returns {Promise<GuildBanPool>} The ban manager.
   */
  public fetch(options: { cache?: true }): Promise<GuildBanPool>;

  /**
   * Fetches a ban or bans from the discord api.
   * @param {FetchBans} options Fetch options.
   * @param {boolean} [force] If you don't want to check for an already cached item.
   */
  public async fetch(options: FetchBans, force?: boolean): Promise<Collection<string, Ban> | GuildBanPool | Ban> {
    const cache = options.cache ?? true;
    if (options.id) {
      if (!force) {
        const cached = this.cache.get(options.id);
        if (cached) return cached;
      }

      const data = await this.client.rest.get(this._ep(`/${options.id}`)),
        ban = this._create(data, this.guild);

      return cache
        ? this._set(ban)
        : ban;
    }

    const bans = await this.client.rest.get(this._ep()),
      col = cache
        ? this.cache
        : new Collection<string, Ban>();

    for (const res of bans as APIBan[]) {
      const ban = this._create(res);
      col.set(ban.id, ban);
    }

    return cache ? this : col;
  }

  protected _ep(...toAppend: string[]): string {
    return `${this.guild._ep()}/bans${toAppend.join("")}`;
  }
}

export interface BanOptions {
  /**
   * Reason for the ban
   */
  reason?: string;

  /**
   * Number of days to delete messages for (0-7)
   */
  days?: number;
}

export interface FetchBans {
  /**
   * ID of the ban to fetch.
   */
  id?: string;

  /**
   * Whether to cache the ban.
   */
  cache?: boolean;
}
