/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import {
  APIMessage,
  MessageFlags,
  MessageType,
} from "discord-api-types/default";
import { Collection } from "@neocord/utils";
import { Embed } from "../other/Embed";
import { neo } from "../Extender";
import { DiscordStructure } from "../../util";
import { MessageMentions } from "./MessageMentions";
import { NewsChannel } from "../channel/guild/NewsChannel";
import { SnowflakeBase } from "../SnowflakeBase";

import type { Client } from "../../lib";
import type { User } from "../other/User";
import type { Guild } from "../guild/Guild";
import type { Member } from "../guild/Member";
import type { TextBasedChannel } from "../channel/Channel";
import type { MessageDeleteOptions, MessageEditOptions } from "../../managers";
import type { MessageAttachment } from "./MessageAttachment";

export class Message extends SnowflakeBase {
  public readonly structureType = DiscordStructure.Message;

  /**
   * The ID of this message.
   * @type {string}
   */
  public readonly id: string;

  /**
   * The author of this message.
   * @type {User}
   */
  public readonly author: User;

  /**
   * The guild member that sent this message.
   * @type {Member | null}
   */
  public readonly member: Member | null;

  /**
   * The guild that this message was sent in.
   * @type {Guild | null}
   */
  public readonly guild: Guild | null;

  /**
   * The channel that this message was sent.
   * @type {TextBasedChannel}
   */
  public readonly channel: TextBasedChannel;

  /**
   * Any attached files
   * @type {Collection<string, MessageAttachment>}
   */
  public readonly attachments: Collection<string, MessageAttachment>;

  /**
   * The mentions in this message.
   * @type {MessageMentions}
   */
  public mentions!: MessageMentions;

  /**
   * Whether or not this message was TTS.
   * @type {boolean}
   */
  public tts!: boolean;

  /**
   * Used for validating whether a message was sent.
   * @type {string | number | null}
   */
  public nonce!: string | number | null;

  /**
   * The current content of this message.
   * @type {string}
   */
  public content!: string;

  /**
   * The previous content of this message, always null unless editedTimestamp isn't null.
   * @type {string | null}
   */
  public previousContent!: string | null;

  /**
   * The timestamp of when this message was edited, or null if it hasn't been edited.
   * @type {number | null}
   */
  public editedTimestamp!: number | null;

  /**
   * Whether this message is pinned.
   * @type {boolean}
   */
  public pinned!: boolean;

  /**
   * Embeds that were sent along with this message.
   * @type {Array<Embed>}
   */
  public embeds!: Embed[];

  /**
   * The type of message.
   * @type {MessageType}
   */
  public type!: MessageType;

  /**
   * The flags.
   * @type {MessageFlags}
   */
  public flags!: MessageFlags;

  /**
   * Whether this message has been deleted.
   * @type {boolean}
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

    this.id = data.id;
    this.embeds = [];

    this.guild = guild ?? client.guilds.get(data.guild_id as string) ?? null;
    this.channel = this.client.channels.get(
      data.channel_id
    ) as TextBasedChannel;
    this.author = this.client.users["_add"](data.author);
    this.member =
      data.member && this.guild
        ? this.guild.members["_add"]({ ...data.member, user: data.author })
        : null;
    this.attachments = new Collection();

    this._patch(data);
  }

  /**
   * The url to jump to this message.
   * @type {string}
   */
  public get url(): string {
    return `https://discord.com/channels/${
      this.guild ? this.guild.id : "@me"
    }/${this.channel.id}/${this.id}`;
  }

  /**
   * The date in which this message was edited.
   * @type {Date}
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
   * Crosspost a message in a news channel to following channels.
   * @returns {Message}
   */
  public async crosspost(): Promise<Message> {
    if (this.channel instanceof NewsChannel) await this.channel.crosspost(this);
    return this;
  }

  /**
   * Edits this message.
   * @param {MessageEditOptions} options The options to use for editing this message.
   */
  public edit(options: MessageEditOptions): Promise<Message>;

  /**
   * Edits this message.
   * @param {MessageEditData} content The message edit content.
   * @param {MessageEditOptions} [options] The message edit options.
   */
  public async edit(
    content: MessageEditData,
    options?: MessageEditOptions
  ): Promise<Message> {
    const [edit] = await this.channel.messages.resolveMessageData(
      content,
      options
    );
    const data = await this.client.api.get<APIMessage>(
      `/channels/${this.channel.id}/messages/${this.id}`,
      edit
    );
    return this.clone()._patch(data);
  }

  public suppressEmbeds(suppress = true): Promise<Message> {
    let flags = Number(this.flags);
    if (suppress) flags |= MessageFlags.SUPPRESS_EMBEDS;
    else flags &= ~MessageFlags.SUPPRESS_EMBEDS;
    return this.edit({ flags });
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
    this.mentions = new MessageMentions(
      this,
      data.mentions,
      data.mention_everyone,
      data.mention_roles,
      data.mention_channels
    );

    for (const embed of data.embeds) {
      this.embeds.push(new Embed(embed));
    }

    if (data.attachments) {
      for (const attachment of data.attachments) {
        const _new = new (neo.get("MessageAttachment"))(
          attachment.url,
          attachment.filename,
          attachment
        );
        this.attachments.set(attachment.id, _new);
      }
    }

    return this;
  }
}

export type MessageEditData = string | Embed | MessageEditOptions;
