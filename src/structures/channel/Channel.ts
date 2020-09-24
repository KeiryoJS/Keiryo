/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { SnowflakeBase } from "../SnowflakeBase";
import { APIChannel, ChannelType } from "discord-api-types/default";
import { neo, Structures } from "../Extender";

import type { Client } from "../../internal";
import type { DMChannel } from "./DMChannel";
import type { TextChannel } from "./guild/TextChannel";
import type { NewsChannel } from "./guild/NewsChannel";
import type { CategoryChannel } from "./guild/CategoryChannel";
import type { StoreChannel } from "./guild/StoreChannel";
import type { VoiceChannel } from "./guild/VoiceChannel";
import { has } from "@neocord/utils";

export abstract class Channel extends SnowflakeBase {
  /**
   * The types of channel mapped to extender keys.
   * @type {Map<ChannelType, string>}
   * @private
   */
  private static readonly types = new Map<ChannelType, keyof Structures>([
    [ChannelType.GUILD_TEXT, "TextChannel"],
    [ChannelType.DM, "DMChannel"],
    [ChannelType.GROUP_DM, "DMChannel"],
    [ChannelType.GUILD_CATEGORY, "CategoryChannel"],
    [ChannelType.GUILD_NEWS, "NewsChannel"],
    [ChannelType.GUILD_STORE, "StoreChannel"],
    [ChannelType.GUILD_VOICE, "VoiceChannel"],
    [ChannelType.GUILD_NEWS, "NewsChannel"],
  ]);

  /**
   * The ID of this channel.
   * @type {string}
   */
  public readonly id: string;

  /**
   * The typeof channel this is.
   * @type {ChannelType}
   */
  public abstract readonly type: ChannelType;

  /**
   * Whether this channel has been deleted.
   * @type {boolean}
   */
  public deleted = false;

  /**
   * Creates a new instanceof Channel.
   * @param {Client} client The client instance.
   * @param {APIChannel} data The data from the api.
   */
  public constructor(client: Client, data: APIChannel) {
    super(client);

    this.id = data.id;
    this._patch(data);
  }

  /**
   * The REST api endpoint for this channel.
   * @type {string}
   */
  public get endpoint(): string {
    return `/channels/${this.id}`;
  }

  /**
   * Creates a new channel.
   * @param {Client} client The client instance.
   * @param {APIChannel} data The channel data from discord.
   * @param {...*} args The arguments to pass.
   */
  public static create<T extends Channel>(
    client: Client,
    data: APIChannel,
    ...args: any[]
  ): T | null {
    const name = Channel.types.get(data.type);
    if (name) {
      return new (neo.get(name))(client, data, ...args);
    }

    client.emit(
      "debug",
      `(Channels) Received unknown channel type: ${data.type}.`
    );
    return null;
  }

  /**
   * Check whether a channel is in a guild..
   * @param {DiscordChannel} channel The channel to check
   * @returns {boolean} Whether the channel is in a guild or not.
   */
  public static isGuildBased(channel: Channel): channel is GuildBasedChannel {
    // @ts-expect-error
    return has(channel, "guild");
  }

  /**
   * Check whether a channel is textable.
   * @param {DiscordChannel} channel The channel to check
   * @returns {boolean} Whether the channel is textable or not.
   */
  public static isTextable(channel: Channel): channel is TextBasedChannel {
    // @ts-expect-error
    return has(channel, "messages");
  }
}

export type TextBasedChannel = DMChannel | TextChannel | NewsChannel;
export type GuildBasedChannel =
  | TextChannel
  | NewsChannel
  | StoreChannel
  | CategoryChannel
  | VoiceChannel;
export type DiscordChannel = GuildBasedChannel | DMChannel;
