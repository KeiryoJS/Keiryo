/**
 * Modified version of @klasa/core's message builder.
 */

import { array } from "@neocord/utils";

import type { APIEmbed, MessageFlags } from "discord-api-types";
import type { File, RequestData } from "@neocord/rest";
import type { Embed } from "../../structures/other/Embed";

export class MessageBuilder {
  /**
   * The message data.
   * @type {MessageData}
   */
  public body: PartialExcept<MessageData, "allowed_mentions">;

  /**
   * The files to attach.
   * @type {File[]}
   */
  public files: File[];

  /**
   * Creates a new instanceof MessageBuilder.
   * @param {MessageOptions | MessageEditOptions} data The data to pre-define.
   */
  public constructor(data: MessageOptions | MessageEditOptions = {}) {
    this.body = Object.assign(
      {
        allowed_mentions: {
          parse: [],
          roles: [],
          users: [],
        },
      },
      data
    );

    this.files = "files" in data ? data.files ?? [] : [];
  }

  /**
   * Set the content of this message.
   * @param {string} [content]
   */
  public content(content?: string | null): MessageBuilder {
    this.body.content = content;
    return this;
  }

  /**
   * Sets the embed of this message.
   * @param {APIEmbed | null | Embed} [embed] The embed to set
   */
  public embed(embed?: APIEmbed | null | Embed): MessageBuilder {
    this.body.embed = embed;
    return this;
  }

  /**
   * Sets the nonce of this message
   * @param {string | number} [nonce] The nonce to set
   * @returns {MessageBuilder}
   */
  public nonce(nonce?: number | string): MessageBuilder {
    this.body.nonce = nonce;
    return this;
  }

  /**
   * Adds a message attachment to this message
   * @param {File | File[]} file The attachment
   * @returns {MessageBuilder}
   */
  public attach(file: File | File[]): MessageBuilder {
    this.files.push(...array(file));
    return this;
  }

  /**
   * Change whether this message will have text-to-speech.
   * @param {boolean} [tts] The tts of this message
   * @returns {MessageBuilder}
   */
  public tts(tts = !this.body.tts): MessageBuilder {
    this.body.tts = tts;
    return this;
  }

  /**
   * Makes @everyone and @here actually ping people.
   * @returns {MessageBuilder}
   */
  public parseEveryone(): MessageBuilder {
    this.body.allowed_mentions.parse.push("everyone");
    return this;
  }

  /**
   * Allow specific users to be mentioned.
   * @param {...string} users user The {@link User user}s you want to mention.
   * @returns {MessageBuilder}
   */
  public parseUsers(...users: string[]): MessageBuilder {
    if (users.length) this.body.allowed_mentions.users.push(...users);
    else this.body.allowed_mentions.parse.push("users");
    return this;
  }

  /**
   * Allow specific roles to be pinged.
   * @param {...string} roles The {@link Role role}s you want to mention.
   * @returns {MessageBuilder}
   */
  public parseRoles(...roles: string[]): MessageBuilder {
    if (roles.length) this.body.allowed_mentions.roles.push(...roles);
    else this.body.allowed_mentions.parse.push("roles");
    return this;
  }

  /**
   * Splits the message into chunks
   * @param {SplitOptions} [options]
   * @returns {RequestData[]}
   */
  public split(options: SplitOptions = {}): RequestData[] {
    if (!this.body.content) return [this];

    const messages = this._split(options);
    return messages
      .filter((mes) => mes)
      .map((content, i) =>
        i === 0
          ? { body: { ...this.body, content }, files: this.files }
          : { body: { ...this.body, content, embed: null } }
      );
  }

  /**
   * Internal shared method to split the content by.
   * @param {SplitOptions} [options]
   */
  protected _split({
    maxLength = 2000,
    char = "\n",
    prepend = "",
    append = "",
  }: SplitOptions = {}): string[] {
    if (!this.body.content) return [];

    const text = this.body.content;
    const splitText = text.length <= maxLength ? [text] : text.split(char);
    const messages = [];

    if (splitText.some((chunk) => chunk.length > maxLength))
      throw new RangeError("A split message chunk is too big");

    let msg = "";
    for (const chunk of splitText) {
      if (
        msg &&
        msg.length + char.length + chunk.length + append.length > maxLength
      ) {
        messages.push(msg + append);
        msg = prepend;
      }

      msg += (msg && msg !== prepend ? char : "") + chunk;
    }

    messages.push(msg);

    return messages;
  }
}

export type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> &
  Required<Pick<T, K>>;

export type RequiredExcept<T, K extends keyof T> = Partial<Pick<T, K>> &
  Required<Omit<T, K>>;

export interface MessageData {
  content?: string | null;
  embed?: APIEmbed | null;
  nonce?: number | string;
  tts?: boolean;
  allowed_mentions?: Required<AllowedMentions>;
}

export interface MessageEditOptions {
  content?: string | null;
  embed?: APIEmbed | null;
  flags?: MessageFlags;
}

export interface AllowedMentions {
  parse?: ("users" | "roles" | "everyone")[];
  roles?: string[];
  users?: string[];
}

export interface MessageOptions extends Omit<MessageData, "allowed_mentions"> {
  files?: File[];
  allowedMentions?: Required<AllowedMentions>;
}

export interface SplitOptions {
  maxLength?: number;
  char?: string;
  prepend?: string;
  append?: string;
}
