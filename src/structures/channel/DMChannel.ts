/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Channel } from "./Channel";
import { APIChannel, APIUser, ChannelType } from "discord-api-types";
import { Builder, MessageManager } from "../../managers";
import { Typing } from "./Typing";

import type { User } from "../other/User";
import type { MessageBuilder, MessageOptions } from "../../managers";
import type { Client } from "../../lib";
import type { Message } from "../message/Message";
import type { Embed } from "../other/Embed";

export class DMChannel extends Channel {
  /**
   * The type of this channel.
   * @type {ChannelType.DM}
   */
  public readonly type = ChannelType.DM;

  /**
   * The messages manager.
   */
  public readonly messages: MessageManager;

  /**
   * The typing manager for this DM channel.
   */
  public readonly typing: Typing;

  /**
   * The ID of the last message sent in this DM channel.
   */
  public lastMessageId!: string | null;

  /**
   * The recipients of this DM.
   */
  public recipients!: User[];

  /**
   * Whether this DM channel has been deleted.
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
   * @returns {boolean}
   */
  public get postable(): boolean {
    return true;
  }

  /**
   * If the current user can embed links in this channel.
   * @returns {boolean}
   */
  public get embeddable(): boolean {
    return true;
  }

  /**
   * If the current user can view this channel.
   * @returns {boolean}
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
   * Creates a new message in this channel.
   * @param {Builder} builder The message builder.
   * @returns {Promise<Message[]>} The created messages.
   */
  public send(builder: Builder | MessageBuilder): Promise<Message[]>;

  /**
   * Creates a new message in this channel.
   * @param {Embed} embed The embed to send.
   * @param {MessageOptions} [options] The message options.
   * @returns {Promise<Message[]>} The created messages.
   */
  public send(
    embed: Embed,
    options?: Omit<MessageOptions, "embed">
  ): Promise<Message[]>;

  /**
   * Creates a new message in this channel.
   * @param {string} content The content to send.
   * @param {MessageOptions} [options] The message options.
   * @returns {Promise<Message[]>} The created messages.
   */
  public send(
    content: string,
    options?: Omit<MessageOptions, "content">
  ): Promise<Message[]>;

  public async send(
    p1: string | Embed | Builder | MessageBuilder,
    p2?: MessageOptions
  ): Promise<Message[]> {
    return this.messages.new(p1, p2);
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
