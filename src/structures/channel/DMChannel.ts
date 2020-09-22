/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { APIChannel, APIUser, ChannelType } from "discord-api-types";
import { DiscordStructure } from "../../util";
import { Channel } from "./Channel";

import type { User } from "../other/User";
import { Typing } from "./Typing";
import {
  Builder,
  BulkDeleteOptions,
  MessageAdd,
  MessageBuilder,
  MessageManager,
  MessageOptions,
  MessageResolvable,
  PinnedMessageManager,
} from "../../managers";
import type { snowflake } from "@neocord/utils";
import type { Client } from "../../internal";
import type { Message } from "../message/Message";

export class DMChannel extends Channel {
  public readonly structureType = DiscordStructure.DMChannel;

  /**
   * The type of this channel.
   * @type {ChannelType.DM}
   */
  public readonly type = ChannelType.DM;

  /**
   * The recipients of this DM.
   * @type {Array<User>}
   */
  public recipients!: User[];

  /**
   * Whether this DM channel has been deleted.
   * @type {boolean}
   */
  public deleted = false;

  /**
   * The typing helper for this channel.
   * @type {Typing}
   */
  public readonly typing: Typing;

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
   */
  public constructor(client: Client, data: APIChannel) {
    super(client, data);

    this.typing = new Typing(this);
    this.messages = new MessageManager(this);
    this.pins = new PinnedMessageManager(this);
  }

  /**
   * Whether the current user can attach files in this channel.
   * @type {boolean}
   */
  public get attachable(): boolean {
    return true;
  }

  /**
   * If the current user can send messages in this channel.
   * @type {boolean}
   */
  public get postable(): boolean {
    return true;
  }

  /**
   * If the current user can embed links in this channel.
   * @type {boolean}
   */
  public get embeddable(): boolean {
    return true;
  }

  /**
   * If the current user can view this channel.
   * @type {boolean}
   */
  public get viewable(): boolean {
    return true;
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
   * Closes this DM.
   * @returns {DMChannel}
   */
  public async close(): Promise<DMChannel> {
    await this.client.dms.close(this.id);
    this.deleted = true;
    return this;
  }

  /**
   * Updates this dm channel with data from discord.
   * @protected
   */
  protected _patch(data: APIChannel): this {
    this.recipients = (data.recipients as APIUser[]).map((user) =>
      this.client.users["_add"](user)
    );
    this.lastMessageId = data.last_message_id as string | null;
    this.lastPinTimestamp = data.last_pin_timestamp
      ? Date.parse(data.last_pin_timestamp)
      : null;

    return super._patch(data);
  }
}
