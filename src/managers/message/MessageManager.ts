/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Collection, Duration, sleep } from "@neocord/utils";
import { BaseManager, BaseResolvable } from "../BaseManager";
import { MessageBuilder, MessageOptions } from "./MessageBuilder";
import { neo } from "../../structures";
import { Embed } from "../../structures/other/Embed";
import { makeSafeQuery } from "../../util";

import type { Message } from "../../structures/message/Message";
import type { RequestData } from "@neocord/rest";
import type { APIMessage } from "discord-api-types";
import type { GuildTextChannel } from "../../structures/channel/guild/GuildTextChannel";
import type { DMChannel } from "../../structures/channel/DMChannel";

export class MessageManager extends BaseManager<Message> {
  /**
   * The text channel.
   */
  public readonly channel: GuildTextChannel | DMChannel;

  /**
   * Creates a new instanceof MessageManager.
   * @param {TextBasedChannel} channel The text channel instance.
   */
  public constructor(channel: GuildTextChannel | DMChannel) {
    super(channel.client, neo.get("Message"));

    this.channel = channel;
  }

  /**
   * The total amount of messages that can be cached at one point in time.
   */
  public get limit(): number {
    return Infinity;
  }

  /**
   * Deletes a message from the channel.
   * @param {string} message The message to delete.
   * @param {MessageDeleteOptions} options The delete options.
   * @returns {Message} The deleted message.
   */
  public async remove(
    message: MessageResolvable,
    options: MessageDeleteOptions = {}
  ): Promise<Message | null> {
    const toDelete = this.resolve(message);
    if (toDelete) {
      if (options.wait) {
        const ms =
          typeof options.wait === "number"
            ? options.wait
            : Duration.parse(options.wait);

        await sleep(ms);
      }

      await this.client.api.delete(
        `/channels/${this.channel.id}/messages/${toDelete.id}`,
        {
          reason: options?.reason,
        }
      );

      toDelete.deleted = true;
    }

    return toDelete;
  }

  /**
   * Creates a new message.
   * @param {Builder} builder The message builder.
   * @returns {Promise<Message[]>} The created messages.
   */
  public new(builder: Builder | MessageBuilder): Promise<Message[]>;

  /**
   * Creates a new message.
   * @param {Embed} embed The embed to send.
   * @param {MessageOptions} [options] The message options.
   * @returns {Promise<Message[]>} The created messages.
   */
  public new(
    embed: Embed,
    options?: Omit<MessageOptions, "embed">
  ): Promise<Message[]>;

  /**
   * Creates a new message.
   * @param {string} content The content to send.
   * @param {MessageOptions} [options] The message options.
   * @returns {Promise<Message[]>} The created messages.
   */
  public new(
    content: string,
    options?: Omit<MessageOptions, "content">
  ): Promise<Message[]>;

  /**
   * Creates a new message in this channel.
   * @param {*} content The first parameter.
   * @param {*} options The second parameter
   */
  public new(
    content: string | Embed | Builder | MessageBuilder,
    options?: MessageOptions
  ): Promise<Message[]>;

  public async new(
    p1: string | Embed | Builder | MessageBuilder,
    p2?: MessageOptions
  ): Promise<Message[]> {
    const finish = async (split: RequestData[]) => {
      const ep = `/channels/${this.channel.id}/messages`;
      const messages = await Promise.all(
        split.map((d) => this.client.api.post<APIMessage[]>(ep, d))
      );
      return messages.map((m) => this._add(m));
    };

    if (p1 instanceof MessageBuilder) return finish(p1.split());
    if (typeof p1 === "function") {
      const builder = await p1(new MessageBuilder());
      if (!builder)
        throw new Error("Builder function must return the Message Builder.");
      return finish(builder.split());
    }

    const builder = new MessageBuilder(p2);
    p1 instanceof Embed ? builder.embed(p1) : builder.content(p1);

    return finish(builder.split());
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
    if (typeof messages === "number") {
      messages = Math.abs(messages);
      if (messages > 100 || messages < 2)
        throw new RangeError(
          "Delete count must not be lower than 2 or high than 100."
        );

      const fetched = await this.fetch({ limit: messages });

      messages = [];
      for (const [id, m] of fetched) {
        const old = !(Date.now() - m.createdTimestamp >= Duration.parse("2w"));
        if (options.filterOld && !old) messages.push(id);
      }

      if (messages.length < 2)
        throw new Error("Can't delete any more messages.");
    }

    if (messages.some((m) => typeof m !== "string"))
      messages = messages.map((m) => this.resolveId(m) as string);

    await this.client.api.post(
      `/channels/${this.channel.id}/messages/bulk-delete`,
      {
        reason: options.reason,
        body: { messages },
      }
    );

    return messages as string[];
  }

  /**
   * Fetches a single message from the channel.
   * @param {string} id ID of the message to fetch.
   * @param {boolean} [force] Whether to skip checking if the message is already cached.
   * @returns {Promise<Message>} The fetched (or cached) message.
   */
  public fetch(id: string, force?: boolean): Promise<Message>;

  /**
   * Fetches 2-100 messages from the channel.
   * @param {MessageFetchOptions} options The fetch options.
   * @returns {Promise<Collection<string, Message>>} The fetched messages.
   */
  public fetch(
    options: MessageFetchOptions
  ): Promise<Collection<string, Message>>;

  public async fetch(
    options: MessageFetchOptions | string,
    force?: boolean
  ): Promise<Message | Collection<string, Message>> {
    if (typeof options === "string") {
      let msg = this.get(options);
      if (!force || !msg) {
        const data = await this.client.api.get(
          `/channels/${this.channel.id}/messages/${options}`
        );
        msg = this._add(data);
      }

      return msg;
    }

    const col = new Collection<string, Message>(),
      messages = await this.client.api.get<APIMessage[]>(
        `/channels/${this.channel.id}/messages`,
        {
          query: makeSafeQuery(options),
        }
      );

    for (const data of messages) {
      const message = this._add(data);
      col.set(message.id, message);
    }

    return col;
  }
}

export type Builder = (
  builder: MessageBuilder
) => MessageBuilder | Promise<MessageBuilder>;

export type MessageResolvable = BaseResolvable<Message>;

export interface BulkDeleteOptions {
  filterOld?: boolean;
  reason?: string;
}

export interface MessageFetchOptions {
  around?: string;
  before?: string;
  after?: string;

  limit?: number;
}

export interface MessageDeleteOptions {
  /**
   * How long to wait before deleting the message.
   */
  wait?: string | number;

  /**
   * The reason for deleting the message.
   */
  reason?: string;
}
