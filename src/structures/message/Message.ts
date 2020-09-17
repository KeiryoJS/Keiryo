/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Snowflake } from "@neocord/utils";
import { Base } from "../Base";
import { Embed } from "../other/Embed";

import type {
  APIMessage,
  MessageFlags,
  MessageType,
} from "discord-api-types/default";
import type { Client } from "../../lib";
import type { User } from "../other/User";
import type { Guild } from "../guild/Guild";
import type { Member } from "../guild/Member";
import type { TextBasedChannel } from "../channel/Channel";
import type { MessageDeleteOptions, MessageOptions } from "../../managers";

export class Message extends Base {
  /**
   * The ID of this message.
   */
  public readonly id: string;

  /**
   * The author of this message.
   */
  public readonly author: User;

  /**
   * The guild member that sent this message.
   */
  public readonly member: Member | null;

  /**
   * The guild that this message was sent in.
   */
  public readonly guild: Guild | null;

  /**
   * The channel that this message was sent.
   */
  public readonly channel: TextBasedChannel;

  /**
   * Whether or not this message was TTS.
   */
  public tts!: boolean;

  /**
   * Used for validating whether a message was sent.
   */
  public nonce!: string | number | null;

  /**
   * The current content of this message.
   */
  public content!: string;

  /**
   * The previous content of this message, always null unless editedTimestamp isn't null.
   */
  public previousContent!: string | null;

  /**
   * The timestamp of when this message was edited, or null if it hasn't been edited.
   */
  public editedTimestamp!: number | null;

  /**
   * Whether this message is pinned.
   */
  public pinned!: boolean;

  /**
   * Embeds that were sent along with this message.
   */
  public embeds!: Embed[];

  /**
   * The type of message.
   */
  public type!: MessageType;

  /**
   * The flags.
   */
  public flags!: MessageFlags;

  /**
   * Whether this message has been deleted.
   */
  public deleted = false;

  /**
   * Creates a new instance of Message.
   * @param {Client} client The client instance.
   * @param {APIMessage} data The decoded message object.
   * @param {Guild} guild The guild instance.
   */
  public constructor(client: Client, data: APIMessage, guild?: Guild) {
    super(client);

    this.guild = guild ?? client.guilds.get(data.guild_id as string) ?? null;
    this.channel = this.client.channels.get(
      data.channel_id
    ) as TextBasedChannel;

    this.member =
      data.member && this.guild
        ? this.guild.members["_add"]({ ...data.member, user: data.author })
        : null;

    this.id = data.id;
    this.author = this.client.users["_add"](data.author);
  }

  /**
   * The snowflake data of this ID.
   */
  public get snowflake(): Snowflake {
    return new Snowflake(this.id);
  }

  /**
   * The timestamp in which this message was created.
   */
  public get createdTimestamp(): number {
    return this.snowflake.timestamp;
  }

  /**
   * The date in which this message was created.
   */
  public get createdAt(): Date {
    return new Date(this.createdTimestamp);
  }

  /**
   * The date in which this message was edited.
   */
  public get editedAt(): Date | null {
    return this.editedTimestamp ? new Date(this.editedTimestamp) : null;
  }

  /**
   * Deletes this message from the channel.
   * @param {MessageDeleteOptions} [options] Options for deleting this message.
   * @returns {Message}
   */
  public async delete(options: MessageDeleteOptions = {}): Promise<this> {
    await this.channel.messages.remove(this, options);
    return this;
  }

  /**
   * Sends a new message to the channel but prepends the author mention to the message content.
   * @param {Embed} embed The embed to send.
   * @param {MessageOptions} [options] The message options.
   * @returns {Promise<Message[]>} The created messages.
   */
  public reply(
    embed: Embed,
    options?: Omit<MessageOptions, "embed">
  ): Promise<Message[]>;

  /**
   * Sends a new message to the channel but prepends the author mention to the message content.
   * @param {string} content The content to send.
   * @param {MessageOptions} [options] The message options.
   * @returns {Promise<Message[]>} The created messages.
   */
  public reply(
    content: string,
    options?: Omit<MessageOptions, "content">
  ): Promise<Message[]>;

  public reply(
    p1: string | Embed,
    options?: MessageOptions
  ): Promise<Message[]> {
    const content = typeof p1 === "string" ? p1 : options?.content;

    return this.channel.messages.new(
      `${this.author}${content ? `, ${content}` : ""}`,
      options
    );
  }

  /**
   * Patches this message with data from the api.
   * @protected
   */
  protected _patch(data: APIMessage): this {
    if (data.edited_timestamp) this.previousContent = this.content;

    this.nonce = data.nonce ?? null;
    this.tts = data.tts;
    this.type = data.type;
    this.pinned = data.pinned;
    this.content = data.content;
    this.editedTimestamp = data.edited_timestamp
      ? +data.edited_timestamp
      : null;
    this.flags = data.flags ?? 0;

    for (const _embed of data.embeds) this.embeds.push(new Embed(_embed));

    return this;
  }
}
