/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import {
  APIEmbed,
  APIEmbedAuthor,
  APIEmbedField,
  APIEmbedFooter,
  APIEmbedImage,
  APIEmbedProvider,
  APIEmbedThumbnail,
  APIEmbedVideo,
  EmbedType
} from "discord-api-types/default";

export class Embed implements APIEmbed {

  /**
   * The embed video
   */
  public readonly video: APIEmbedVideo;

  /**
   * The embed provider.
   */
  public readonly provider: APIEmbedProvider;

  /**
   * The type of embed.
   */
  public readonly type: EmbedType;

  /**
   * The title of this embed.
   */
  public title?: string;

  /**
   * The description of this embed.
   */
  public description?: string;

  /**
   * The URL of this embed.
   */
  public url?: string;

  /**
   * The embed timestamp.
   */
  public timestamp?: string;

  /**
   * The color of this embed.
   */
  public color?: number;

  /**
   * The embed footer.
   */
  public footer?: APIEmbedFooter;

  /**
   * The embed image.
   */
  public image: APIEmbedImage;

  /**
   * The embed thumbnail.
   */
  public thumbnail: APIEmbedThumbnail;

  /**
   * The embed author
   */
  public author: APIEmbedAuthor;

  /**
   * The fields in this embed.
   */
  public fields: APIEmbedField[];

  /**
   * Creates a new Embed instance.
   * @param base
   */
  public constructor(base: Embed | APIEmbed = {}) {
    this.video = base.video ?? {};
    this.provider = base.provider ?? {};
    this.type = base.type ?? EmbedType.Rich;

    this.title = base.title;
    this.description = base.description;
    this.url = base.url;
    this.timestamp = base.timestamp;
    this.color = base.color;

    this.footer = base.footer;
    this.image = base.image ?? {};
    this.thumbnail = base.thumbnail ?? {};
    this.author = base.author ?? {};
    this.fields = base.fields ?? [];
  }

  /**
   * Set the title of this embed.
   * @param text The title text.
   */
  public setTitle(text: StringResolvable): this {
    this.title = text.toString();
    return this;
  }

  /**
   * Set the description of this embed.
   * @param text The description content.
   */
  public setDescription(text: StringResolvable | StringResolvable[]): this {
    this.description = Array.isArray(text)
      ? text.join("\n")
      : text.toString();

    return this;
  }
}

export interface StringResolvable {
  toString(): string;
}
