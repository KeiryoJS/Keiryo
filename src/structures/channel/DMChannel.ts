/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Channel } from "./Channel";
import { APIChannel, APIUser, ChannelType } from "discord-api-types";
import {
  Builder,
  MessageAdd,
  MessageBuilder,
  MessageManager,
  MessageOptions,
} from "../../managers";
import { Typing } from "./Typing";
import { DiscordStructure } from "../../util";

import type { User } from "../other/User";
import type { Client } from "../../lib";
import type { Message } from "../message/Message";

export class DMChannel extends Channel {
  public readonly structureType = DiscordStructure.DMChannel;

  /**
   * The type of this channel.
   * @type {ChannelType.DM}
   */
  public readonly type = ChannelType.DM;

  /**
   * The messages manager.
   * @type {MessageManager}
   */
  public readonly messages: MessageManager;

  /**
   * The typing manager for this DM channel.
   * @type {Typing}
   */
  public readonly typing: Typing;

  /**
   * The ID of the last message sent in this DM channel.
   * @type {string | null}
   */
  public lastMessageId!: string | null;

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
   * Creates a new instanceof DMChannel
   * @param {Client} client The channel instance.
   * @param {APIChannel} data The channel data.
   */
  public constructor(client: Client, data: APIChannel) {
    super(client, data);

    this.typing = new Typing(this);
    this.messages = new MessageManager(this);
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
   * Closes this DM.
   * @returns {DMChannel}
   */
  public async close(): Promise<DMChannel> {
    await this.client.dms.close(this.id);
    this.deleted = true;
    return this;
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
   * Updates this dm channel with data from discord.
   * @protected
   */
  protected _patch(data: APIChannel): this {
    this.recipients = (data.recipients as APIUser[]).map((user) =>
      this.client.users["_add"](user)
    );
    this.lastMessageId = data.last_message_id as string | null;

    return super._patch(data);
  }
}
