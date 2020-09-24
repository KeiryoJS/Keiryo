/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Collection } from "@neocord/utils";
import { BaseManager } from "./BaseManager";
import { URLSearchParams } from "url";
import { DiscordStructure } from "../util";
import { neo } from "../structures";

import type { APIBan } from "discord-api-types";
import type { Ban } from "../structures/guild/Ban";
import type { Guild } from "../structures/guild/Guild";
import type { UserResolvable } from "./UserManager";

export class BanManager extends BaseManager<Ban> {
  /**
   * The guild this ban manager belongs to.
   * @type {Guild}
   */
  public readonly guild: Guild;

  /**
   * Creates a new instanceof BanManager.
   * @param {Guild} guild The {@link Guild guild} instance.
   */
  public constructor(guild: Guild) {
    super(guild.client, {
      structure: DiscordStructure.Ban,
      class: neo.get("Ban"),
    });

    this.guild = guild;
  }

  /**
   * Create a guild ban, and optionally delete previous messages sent by the banned user.
   * @param {UserResolvable} user The user to ban.
   * @param {BanOptions} [options] The ban options. {@see BanOptions}
   * @returns {Promise<BanManager>} The {@link BanManager ban manager}
   */
  public async new(
    user: UserResolvable,
    options: BanOptions = {}
  ): Promise<BanManager> {
    const query = new URLSearchParams();
    if (options.days)
      query.append("delete-message-days", options.days.toString());
    if (options.reason) query.append("reason", options.reason);

    const id = this.client.users.resolveId(user);
    await this.client.api.put(`/guilds/${this.guild.id}/bans/${id}`, {
      reason: options.reason,
      query,
    });

    return this;
  }

  /**
   * Remove the ban for a user.
   * @param {UserResolvable} user The {@link User user} to unban.
   * @param {string} [reason] The audit-log ban reason.
   * @returns {Promise<Ban | null>} The removed {@link Ban ban}.
   */
  public async remove(
    user: UserResolvable,
    reason?: string
  ): Promise<Ban | null> {
    const ban = this.resolve(user);
    if (ban) {
      await this.client.api.delete(`/guilds/${this.guild.id}/bans/${ban.id}`, {
        reason,
      });
    }

    return ban;
  }

  /**
   * Fetches a ban from the guild.
   * @param {FetchBans} options The fetch options.
   * @param {boolean} force Whether to skip checking if the ban is already cached.
   * @returns {Promise<Ban>} The fetched (or cached) {@link Ban ban}.
   */
  public fetch(
    options: { id: string; cache?: boolean },
    force?: boolean
  ): Promise<Ban>;

  /**
   * Fetches all bans for the guild and populates a new {@link Collection collection}.
   * @param {FetchBans} options The fetch options.
   * @returns {Promise<Collection<string, Ban>>} The new {@link Collection collection}.
   */
  public fetch(options: { cache: false }): Promise<Collection<string, Ban>>;

  /**
   * Fetches all bans for the guild and populates this manager.
   * @param {FetchBans} options The fetch options.
   * @returns {Promise<BanManager>} The ban manager.
   */
  public fetch(options: { cache?: true }): Promise<BanManager>;

  /**
   * Fetches a ban from the discord api.
   * @param {FetchBans} options The options to use when fetching the ban.
   * @param {boolean} [force] Whether to skip checking if the item is already cached.
   */
  public async fetch(
    options: FetchBans = {},
    force?: boolean
  ): Promise<Collection<string, Ban> | BanManager | Ban> {
    const cache = options.cache ?? true;
    if (options.id) {
      if (!force) {
        const cached = this.get(options.id);
        if (cached) return cached;
      }

      // Create a new instance of Ban.
      const data = await this.client.api.get<APIBan>(
        `/guilds/${this.guild.id}/bans/${options.id}`
      );
      const ban = new this.class(this.guild, data);
      return cache ? this._add(ban) : ban;
    }

    // Fetch all bans.
    const bans = await this.client.api.get(`/guilds/${this.guild.id}/bans`);
    const col: BanManager | Collection<string, Ban> = cache
      ? this
      : new Collection<string, Ban>();

    for (const data of bans as APIBan[]) {
      const ban = new this.class(data);
      if (col instanceof BaseManager) col._set(ban);
      else col.set(ban.id, ban);
    }

    return col;
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
  id?: string;
  cache?: boolean;
}
