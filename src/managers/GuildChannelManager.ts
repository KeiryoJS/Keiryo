/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Collection } from "@neocord/utils";
import { BaseManager, BaseResolvable } from "./BaseManager";
import { neo } from "../structures/Extender";
import { Channel } from "../structures/channel/Channel";
import { DiscordStructure } from "../util";

import type {
  APIChannel,
  RESTGetAPIChannelResult,
  RESTGetAPIGuildChannelsResult,
} from "discord-api-types";
import type { GuildChannel } from "../structures/channel/guild/GuildChannel";
import type { Guild } from "../structures/guild/Guild";

export class GuildChannelManager extends BaseManager<GuildChannel> {
  /**
   * The guild this channel cache belongs to.
   * @type {Guild}
   */
  public readonly guild: Guild;

  /**
   * Creates a new instanceof GuildChannelCache
   * @param {Guild} guild The {@link Guild guild} instance.
   */
  public constructor(guild: Guild) {
    super(guild.client, neo.get("GuildChannel"));

    this.guild = guild;
  }

  /**
   * The amount of guild channels that can be cached at one point in time.
   * @type {number}
   */
  public limit(): number {
    return (
      this.client.data.limits.get(DiscordStructure.GuildChannel) ?? Infinity
    );
  }

  /**
   * Get a guild channel.
   * @param {string} id ID of the channel to get.
   * @returns {GuildChannel} The guild channel
   */
  public get<T extends GuildChannel = GuildChannel>(id: string): T | undefined {
    return super.get(id) as T;
  }

  /**
   * Removes a channel from the guild.
   * @param {GuildChannel} channel The channel to remove.
   * @returns {GuildChannel | null} The removed channel.
   */
  public async remove<T extends GuildChannel = GuildChannel>(
    channel: BaseResolvable<T>
  ): Promise<T | null> {
    const c = this.resolve(channel);
    if (c) {
      await this.client.api.delete(`/guilds/${this.guild.id}/channels/${c.id}`);
      c.deleted = true;
      return c as T;
    }

    return null;
  }

  /**
   * Fetches a {@link GuildChannel guild channel} from the discord api.
   * @param {string} channelId ID of the channel to fetch.
   * @param {boolean} [force] Skips checking if the channel is already cached.
   * @returns {Promise<GuildChannel>} The fetched channel.
   */
  public fetch<T extends GuildChannel = GuildChannel>(
    channelId: string,
    force?: boolean
  ): Promise<T>;

  /**
   * Fetches all channels in the guild.
   * @returns {Promise<Collection<string, GuildChannel>>} The {@link GuildChannel guild channel} cache.
   */
  public fetch(): Promise<Collection<string, GuildChannel>>;

  /**
   * Fetches all channels or a specific one.
   * @param {string} [channel] ID of the channel to fetch.
   * @param {boolean} [force] Skips checking if the channel is already cached.
   * @returns {Collection<string, GuildChannel> | GuildChannel}
   */
  public async fetch(
    channel?: string,
    force?: boolean
  ): Promise<Collection<string, GuildChannel> | GuildChannel> {
    if (channel) {
      if (!force) {
        const cached = this.get(channel);
        if (cached) return cached;
      }

      const data = await this.client.api.get<RESTGetAPIChannelResult>(
        `/guilds/${this.guild.id}/channels/${channel}`
      );
      return this._add(data);
    }

    const col = new Collection<string, GuildChannel>();
    const channels = await this.client.api.get<RESTGetAPIGuildChannelsResult>(
      `/guilds/${this.guild.id}`
    );
    for (const data of channels) {
      const channel = this._add(data);
      col.set(channel.id, channel);
    }

    return col;
  }

  /**
   * Adds a new item to this manager.
   * @data {APIChannel} data
   * @private
   */
  protected _add(data: APIChannel): GuildChannel {
    const existing = this.get(data.id);
    if (existing) return existing["_patch"](data);
    return this._set(
      Channel.create(this.client, data, this.guild) as GuildChannel
    );
  }
}
