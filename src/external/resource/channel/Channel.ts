import { APIChannel, ChannelType } from "discord-api-types";
import { has } from "@neocord/utils";
import { Resource } from "../../abstract";
import { resources, Structures } from "../Resources";

import type { Client } from "../../../client";
import type { DMChannel } from "./DMChannel";

import type { CategoryChannel } from "./guild/CategoryChannel";
import type { VoiceChannel } from "./guild/VoiceChannel";
import type { TextChannel } from "./guild/TextChannel";
import type { NewsChannel } from "./guild/NewsChannel";
import type { StoreChannel } from "./guild/StoreChannel";

export abstract class Channel extends Resource {
  /**
   * The types of channel mapped to extender keys.
   * @type {Map<ChannelType, string>}
   *
   * @private
   */
  private static readonly types = new Map<ChannelType, keyof Structures>([
    [ ChannelType.GUILD_TEXT, "TextChannel" ],
    [ ChannelType.DM, "DMChannel" ],
    [ ChannelType.GROUP_DM, "DMChannel" ],
    [ ChannelType.GUILD_CATEGORY, "CategoryChannel" ],
    [ ChannelType.GUILD_NEWS, "NewsChannel" ],
    [ ChannelType.GUILD_STORE, "StoreChannel" ],
    [ ChannelType.GUILD_VOICE, "VoiceChannel" ]
  ]);

  /**
   * The ID of this DM channel.
   */
  public readonly id: string;

  /**
   * The type of this channel.
   *
   * @type {ChannelType}
   */
  public abstract readonly type: ChannelType;

  /**
   * @param {Client} client The client instance.
   * @param {APIChannel} data The channel data.
   */
  public constructor(client: Client, data: APIChannel) {
    super(client);

    this.id = data.id;
    this._patch(data);
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
      // @ts-expect-error
      return new (resources.get(name))(client, data, ...args);
    }

    client.emit("debug", `(Channels) Received unknown channel type: ${data.type}.`);
    return null;
  }

  /**
   * Check whether a channel is in a guild..
   * @param {DiscordChannel} channel The channel to check.
   *
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

  /**
   * The REST api endpoint for this channel.
   *
   * @returns {string}
   */
  public _ep(): string {
    return `/channels/${this.id}`;
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

