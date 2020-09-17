/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { SnowflakeBase } from "../SnowflakeBase";
import { APIChannel, ChannelType } from "discord-api-types/default";
import { neo, Structures } from "../Extender";

import type { Client } from "../../lib";
import type { DMChannel } from "./DMChannel";
import type { TextChannel } from "./guild/TextChannel";
import type { NewsChannel } from "./guild/NewsChannel";
import type { CategoryChannel } from "./guild/CategoryChannel";
import type { StoreChannel } from "./guild/StoreChannel";
import type { VoiceChannel } from "./guild/VoiceChannel";

export abstract class Channel extends SnowflakeBase {
  /**
   * The types of channel mapped to extender keys.
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
   */
  public readonly id: string;
  /**
   * The typeof channel this is.
   */
  public abstract readonly type: ChannelType;

  /**
   * Creates a new instanceof Channel.
   * @param client The client instance.
   * @param data The data from the api.
   */
  public constructor(client: Client, data: APIChannel) {
    super(client);

    this.id = data.id;
    this._patch(data);
  }

  /**
   * The REST api endpoint for this channel.
   */
  public get endpoint(): string {
    return `/channels/${this.id}`;
  }

  /**
   * Creates a new channel.
   * @param  {Client} client The client instance.
   * @param data
   * @param args
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
}

export type TextBasedChannel = DMChannel | TextChannel | NewsChannel;
export type GuildBasedTextChannel = TextChannel | NewsChannel;
export type GuildBasedChannel =
  | GuildBasedTextChannel
  | CategoryChannel
  | StoreChannel
  | VoiceChannel;
