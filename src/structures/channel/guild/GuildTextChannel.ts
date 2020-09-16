/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { GuildChannel, ModifyGuildChannel } from "./GuildChannel";
import { Typing } from "../Typing";

import type { APIChannel, ChannelType } from "discord-api-types";
import type { Client } from "../../../lib";
import type { Guild } from "../../guild/Guild";
import type { CategoryChannel } from "./CategoryChannel";

export abstract class GuildTextChannel extends GuildChannel {
  /**
   * The typing handler for this guild text channel.
   * @type {Typing}
   */
  public readonly typing: Typing;

  /**
   * Whether this channel is not safe for work.
   * @type {boolean}
   */
  public nsfw!: boolean;

  /**
   * ID of the last message sent in this channel.
   * @type {string}
   */
  public lastMessageId!: string | null;

  /**
   * Timestamp of the last pinned message.
   * @type {string}
   */
  public lastPinTimestamp!: string | null;

  /**
   * The channel topic.
   * @type {string}
   */
  public topic!: string | null;

  /**
   * Creates a new instanceof GuildTextChannel
   * @param {Client} client The client instance.
   * @param {APIChannel} data The channel data from the discord gateway/api.
   * @param {Guild} guild The guild instance.
   */
  public constructor(client: Client, data: APIChannel, guild: Guild) {
    super(client, data, guild);

    this.typing = new Typing(this);
  }

  /**
   * If the current user can send messages in this channel.
   * @returns {boolean}
   */
  public get postable(): boolean {
    // TODO: get the permissions for the current user.
    return true;
  }

  /**
   * If the current user can embed links in this channel.
   * @returns {boolean}
   */
  public get embeddable(): boolean {
    // TODO: get the permissions for the current user.
    return true;
  }

  /**
   * If the current user can view this channel.
   * @returns {boolean}
   */
  public get viewable(): boolean {
    // TODO: get the permissions for the current user.
    return true;
  }

  /**
   * Updates this channel with data from Discord.
   * @protected
   */
  protected _patch(data: APIChannel): this {
    this.nsfw = data.nsfw ?? false;
    this.topic = data.topic ?? null;
    this.lastMessageId = data.last_message_id ?? null;
    this.lastPinTimestamp = data.last_pin_timestamp ?? null;

    return this;
  }
}

export interface ModifyGuildTextChannel extends ModifyGuildChannel {
  type?: ChannelType.GUILD_TEXT | ChannelType.GUILD_NEWS;
  topic?: string | null;
  nsfw?: boolean;
  parent?: string | CategoryChannel;
}

