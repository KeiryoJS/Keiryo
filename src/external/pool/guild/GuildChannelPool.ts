/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Collection } from "@neocord/utils";
import { ResourceLike, ResourcePool, ResourceType } from "../../abstract";
import { resources } from "../../resource/Resources";
import { Channel, GuildBasedChannel } from "../../resource/channel/Channel";

import type { APIChannel, RESTGetAPIGuildChannelsResult } from "discord-api-types";
import type { GuildChannel } from "../../resource/channel/guild/GuildChannel";
import type { Guild } from "../../resource/guild/Guild";

export class GuildChannelPool extends ResourcePool<GuildBasedChannel> {
  /**
   * The guild this channel pool belongs to.
   *
   * @type {Guild}
   */
  readonly #guild: Guild;

  /**
   * @param {Guild} guild The {@link Guild guild} instance.
   */
  public constructor(guild: Guild) {
    super(guild.client, {
      // @ts-expect-error
      class: resources.get("GuildChannel"),
      resource: ResourceType.GuildChannel
    });

    this.#guild = guild;
  }

  /**
   * The guild this channel cache belongs to.
   *
   * @type {Guild}
   */
  public get guild(): Guild {
    return this.#guild;
  }

  /**
   * Get a guild channel from the cache.
   * @param {string} id ID of the channel to get.
   *
   * @returns {GuildChannel} The guild channel
   */
  public get<T extends GuildChannel = GuildChannel>(id: string): T | null {
    return this.cache.get(id) as T ?? null;
  }

  /**
   * Removes a channel from the guild.
   * @param {GuildChannel} channel The channel to remove.
   * @param {string} [reason] The reason that the channel was deleted.
   *
   * @returns {GuildChannel | null} The removed channel.
   */
  public async remove<T extends GuildChannelLike>(channel: T, reason?: string): Promise<T> {
    const id = this.resolveId(channel);
    if (id) {
      await this.client.rest.delete(
        `/guilds/${this.guild.id}/channels/${id}`,
        {
          reason
        }
      );

      return channel;
    }

    throw new Error("Couldn't resolve an id.");
  }


  /**
   * Fetches a {@link GuildChannel guild channel} from the discord api.
   * @param {string} channelId ID of the channel to fetch.
   * @param {boolean} [force] Skips checking if the channel is already cached.
   *
   * @returns {Promise<GuildChannel>} The fetched channel.
   */
  public fetch<T extends GuildChannel = GuildChannel>(
    channelId: string,
    force?: boolean): Promise<T>;

  /**
   * Fetches all channels in the guild.
   *
   * @returns {Promise<Collection<string, GuildChannel>>} The {@link GuildChannel guild channel} cache.
   */
  public fetch(): Promise<Collection<string, GuildChannel>>;

  /**
   * Fetches all channels or a specific one.
   * @param {string} [channel] ID of the channel to fetch.
   * @param {boolean} [force] Skips checking if the channel is already cached.
   *
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

      const data = await this.client.rest.get(`/guilds/${this.guild.id}/channels/${channel}`);
      return this._add(data);
    }

    const col = new Collection<string, GuildChannel>();
    const channels = await this.client.rest.get(`/guilds/${this.guild.id}`);

    for (const data of channels as RESTGetAPIGuildChannelsResult) {
      const channel = this._add(data);
      col.set(channel.id, channel);
    }

    return col;
  }

  /**
   * Creates a channel based off the provided data.
   * @param {APIChannel} data
   * @param {...any} args
   *
   * @protected
   */
  protected _create(data: APIChannel, ...args: any[]): GuildBasedChannel {
    return Channel.create(this.client, data, this.guild, ...args) as GuildBasedChannel;
  }
}

export type GuildChannelLike = ResourceLike<GuildBasedChannel>;
