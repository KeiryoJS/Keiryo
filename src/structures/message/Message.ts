/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Duration, sleep, Snowflake } from "@neocord/utils";
import { Base } from "../Base";
import { Cacheable } from "../../util";
import { Embed } from "../other/Embed";

import type { APIMessage, MessageFlags, MessageType } from "discord-api-types/default";
import type { Client } from "../../lib";
import type { User } from "../other/User";

export class Message extends Base {
  /**
   * The cacheable key of this structure.
   */
  public static CACHE_KEY = Cacheable.Message;

  /**
   * The ID of this message.
   */
  public readonly id: string;

  /**
   * The author of this message.
   */
  public readonly author!: User;

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
   * Creates a new instance of Message.
   * @param client The client instance.
   * @param data The decoded message object.
   */
  public constructor(client: Client, data: APIMessage) {
    super(client);

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
    return this.editedTimestamp
      ? new Date(this.editedTimestamp)
      : null;
  }

  /**
   * Deletes this message from the channel.
   * @param options Options for deleting this message.
   */
  public async delete(options: MessageDeleteOptions = {}): Promise<this> {
    if (options.after) {
      const ms = typeof options.after === "number"
        ? options.after
        : Duration.parse(options.after);

      await sleep(ms);
    }

    // todo: delete the message using the messages manager.
    return this;
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
    this.editedTimestamp = data.edited_timestamp ? +data.edited_timestamp : null;
    this.flags = data.flags ?? 0;

    for (const _embed of data.embeds) this.embeds.push(new Embed(_embed));

    return this;
  }
}

export interface MessageDeleteOptions {
  after?: string | number;
  reason?: string;
}
