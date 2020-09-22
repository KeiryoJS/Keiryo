/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Snowflake } from "@neocord/utils";
import { Base } from "../Base";
import { DiscordStructure } from "../../util";

import type { APIEmoji } from "discord-api-types";
import type { Client } from "../../internal";

export abstract class Emoji extends Base {
  public readonly structureType = DiscordStructure.Emoji;

  /**
   * The ID of this emoji.
   * @type {string}
   */
  // @ts-expect-error
  public readonly id: string | null;

  /**
   * The name of this emoji.
   * @type {string}
   */
  public name!: string;

  /**
   * Whether or not this emoji is animated.
   * @type {boolean}
   */
  public animated: boolean;

  /**
   * Whether this emoji has been deleted or not.
   * @type {boolean}
   */
  public deleted: boolean;

  /**
   * @param {Client} client
   * @param {APIEmoji} data
   */
  public constructor(client: Client, data: APIEmoji) {
    super(client);

    this.id = data.id;
    this.animated = data.animated ?? false;
    this.name = data.name as string;
    this.deleted = false;
  }

  /**
   * The identifier for this emoji, used for message reactions.
   * @type {string}
   */
  public get identifier(): string {
    return this.id
      ? `${this.animated ? "a:" : ""}${this.name}:${this.id}`
      : encodeURIComponent(this.name);
  }

  /**
   * The URL to this emoji. Only if it's a custom emoji.
   * @type {?string}
   */
  public get url(): string | null {
    return this.id
      ? this.client.api.cdn.emoji(this.id, this.animated ? "gif" : "png")
      : null;
  }

  /**
   * The date when this object was created.
   * @type {Date}
   */
  public get createdAt(): Date | null {
    return this.createdTimestamp ? new Date(this.createdTimestamp) : null;
  }

  /**
   * The time when this object was created.
   * @type {number}
   */
  public get createdTimestamp(): number | null {
    return this.id ? Snowflake.deconstruct(this.id).timestamp : null;
  }

  /**
   * The string representation of this emoji.
   * @returns {string}
   */
  public toString(): string {
    return this.id
      ? `<${this.animated ? "a" : ""}:${this.name}:${this.id}>`
      : this.name;
  }
}
