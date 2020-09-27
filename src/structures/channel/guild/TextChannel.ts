/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { APIChannel, ChannelType } from "discord-api-types";
import { Duration, snowflake } from "@neocord/utils";
import { exclude, Permission } from "../../../util";
import { EditGuildChannel, GuildChannel } from "./GuildChannel";
import { TypingManager } from "../TypingManager";
import {
  Builder,
  BulkDeleteOptions,
  MessageAdd,
  MessageBuilder,
  MessageManager,
  MessageOptions,
  MessageResolvable,
  PinnedMessageManager,
} from "../../../managers";

import type { Client } from "../../../internal";
import type { Message } from "../../message/Message";
import type { Guild } from "../../guild/Guild";

const MAX_RATE_LIMIT = 21600;

export class TextChannel extends GuildChannel {
  /**
   * The type of this channel.
   * @type {ChannelType.GUILD_TEXT}
   */
  public readonly type: ChannelType = ChannelType.GUILD_TEXT;

  /**
   * The typing helper for this channel.
   * @type {TypingManager}
   */
  public readonly typing: TypingManager;

  /**
   * The message manager for this channel.
   * @type {MessageManager}
   */
  public readonly messages: MessageManager;

  /**
   * The pinned message manager for this channel.
   * @type {PinnedMessageManager}
   */
  public readonly pins: PinnedMessageManager;

  /**
   * Amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission ManageMessages or ManageChannel, are unaffected.
   * Or null if there isn't a configured ratelimit.
   * @type {number}
   */
  public ratelimit!: number | null;

  /**
   * Whether this channel is not safe for work.
   * @type {boolean}
   */
  public nsfw!: boolean;

  /**
   * The channel topic.
   * @type {string}
   */
  public topic!: string | null;

  /**
   * The last message that was sent in this channel.
   * @type {string}
   */
  public lastMessageId!: snowflake | null;

  /**
   * The last message to be pinned in this channel.
   * @type {number | null}
   */
  public lastPinTimestamp!: number | null;

  /**
   * @param {Client} client The client instance.
   * @param {APIChannel} data The data from discord.
   * @param {Guild} guild The guild instance.
   */
  public constructor(client: Client, data: APIChannel, guild: Guild) {
    super(client, data, guild);

    this.typing = new TypingManager(this);
    this.messages = new MessageManager(this);
    this.pins = new PinnedMessageManager(this);
  }

  /**
   * Whether the current user can attach files in this channel.
   * @type {boolean}
   */
  public get attachable(): boolean {
    return (
      this.postable &&
      (this.guild.me.permissionsIn(this).has(Permission.AttachFiles) ?? false)
    );
  }

  /**
   * If the current user can send messages in this channel.
   * @type {boolean}
   */
  public get postable(): boolean {
    return (
      this.viewable &&
      (this.guild.me?.permissionsIn(this).has(Permission.SendMessages) ?? false)
    );
  }

  /**
   * If the current user can embed links in this channel.
   * @type {boolean}
   */
  public get embeddable(): boolean {
    return (
      this.postable &&
      (this.guild.me.permissionsIn(this).has(Permission.EmbedLinks) ?? false)
    );
  }

  /**
   * If the current user can view this channel.
   * @type {boolean}
   */
  public get viewable(): boolean {
    return (
      this.guild.me.permissionsIn(this).has(Permission.ViewChannel) ?? false
    );
  }

  /**
   * Creates a new message.
   * @param {Builder} builder The message builder.
   * @returns {Promise<Message[]>} The created messages.
   */
  public send(builder: Builder | MessageBuilder): Promise<Message[]>;

  /**
   * Creates a new message.
   * @param {MessageOptions} options The message options.
   */
  public send(options: MessageOptions): Promise<Message[]>;

  /**
   * Creates a new message in this channel.
   * @param {MessageAdd} content The message content or builder.
   * @param {MessageOptions} [options] The message options, only when not using the message builder.
   * @returns {Message[]}
   */
  public async send(
    content: MessageAdd,
    options?: MessageOptions
  ): Promise<Message[]>;

  /**
   * Creates a new message in this channel.
   * @param {MessageAdd} content The message content or builder.
   * @param {MessageOptions} [options] The message options, only when not using the message builder.
   * @returns {Message[]}
   */
  public async send(
    content: MessageAdd,
    options?: MessageOptions
  ): Promise<Message[]> {
    return this.messages.new(content, options);
  }

  /**
   * Delete from 2-100 messages in a single request.
   * @param {MessageResolvable[]} messages The messages to delete.
   * @param {BulkDeleteOptions} [options] The bulk-delete options.
   * @returns {Promise<string[]>} IDs of the deleted messages.
   */
  public async bulkDelete(
    messages: MessageResolvable[] | number,
    options: BulkDeleteOptions = {}
  ): Promise<string[]> {
    return this.messages.bulkDelete(messages, options);
  }

  /**
   * Modifies this text channel.
   * @param {EditGuildChannel} data The data to modify the channel with.
   * @param {string} [reason] The reason to provide.
   */
  public async edit(data: EditTextChannel, reason?: string): Promise<this> {
    let ratelimit =
      typeof data.userRatelimit === "string"
        ? Duration.parse(data.userRatelimit)
        : data.userRatelimit;

    if (ratelimit) {
      ratelimit = Math.abs(ratelimit);
      if (ratelimit > MAX_RATE_LIMIT) {
        throw new Error(
          `Rate-limit must not be above ${MAX_RATE_LIMIT} (or ${Duration.parse(
            MAX_RATE_LIMIT,
            true
          )}).`
        );
      }
    }

    return super.edit(
      {
        ...exclude(data, "userRatelimit"),
        rate_limit_per_user: ratelimit,
      },
      reason
    );
  }

  /**
   * Updates this text channel with data from Discord.
   * @param {APIChannel} data
   * @protected
   */
  protected _patch(data: APIChannel): this {
    this.ratelimit = data.rate_limit_per_user ?? null;
    this.nsfw = data.nsfw ?? false;
    this.topic = data.topic ?? null;
    this.lastMessageId = data.last_message_id as string | null;
    this.lastPinTimestamp = data.last_pin_timestamp
      ? Date.parse(data.last_pin_timestamp)
      : null;

    return super._patch(data);
  }
}

export interface EditTextChannel extends EditGuildChannel {
  userRatelimit?: number | string | null;
  type?: ChannelType.GUILD_TEXT | ChannelType.GUILD_NEWS;
  topic?: string | null;
  nsfw?: boolean;
}
