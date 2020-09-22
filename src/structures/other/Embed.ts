/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ColorResolvable, parseColor } from "../../util";
import {
  APIEmbed,
  APIEmbedAuthor,
  APIEmbedField,
  APIEmbedFooter,
  APIEmbedImage,
  APIEmbedProvider,
  APIEmbedThumbnail,
  APIEmbedVideo,
  EmbedType,
} from "discord-api-types/default";

import type { URL } from "url";

export class Embed implements APIEmbed {
  /**
   * The embed video
   * @type {APIEmbedVideo}
   */
  public readonly video: APIEmbedVideo;

  /**
   * The embed provider.
   * @type {APIEmbedProvider}
   */
  public readonly provider: APIEmbedProvider;

  /**
   * The type of embed.
   * @type {EmbedType}
   */
  public readonly type: EmbedType;

  /**
   * The title of this embed.
   * @type {string}
   */
  public title?: string;

  /**
   * The description of this embed.
   * @type {string}
   */
  public description?: string;

  /**
   * The URL of this embed.
   * @type {string}
   */
  public url?: string;

  /**
   * The embed timestamp.
   * @type {string}
   */
  public timestamp?: string;

  /**
   * The color of this embed.
   * @type {string}
   */
  public color?: number;

  /**
   * The embed footer.
   * @type {APIEmbedFooter}
   */
  public footer?: APIEmbedFooter;

  /**
   * The embed image.
   * @type {APIEmbedImage}
   */
  public image: APIEmbedImage;

  /**
   * The embed thumbnail.
   * @type {APIEmbedThumbnail}
   */
  public thumbnail: APIEmbedThumbnail;

  /**
   * The embed author
   * @type {APIEmbedAuthor}
   */
  public author: APIEmbedAuthor;

  /**
   * The fields in this embed.
   * @type {Array<APIEmbedField>}
   */
  public fields: APIEmbedField[];

  /**
   * Creates a new Embed instance.
   * @param {Embed | APIEmbed} base
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
   * The embed color as a hex code.
   * @type {string}
   */
  public get hex(): string | null {
    return this.color ? `#${this.color.toString(16).padStart(6, "0")}` : null;
  }

  /**
   * The accumulated length for the title, description, fields and footer text.
   * @type {number}
   */
  public get length(): number {
    return (
      (this.title?.length ?? 0) +
      (this.description?.length ?? 0) +
      this.fields.reduce((l, f) => l + (f.name.length + f.value.length), 0) +
      (this.footer?.text?.length ?? 0)
    );
  }

  /**
   * Set the thumbnail of this embed.
   * @param {string | URL} url The image url.
   * @param {ImageOptions} [options={}] The options for the image.
   */
  public setThumbnail(
    url: StringResolvable | URL,
    options: ImageOptions = {}
  ): this {
    this.thumbnail = {
      url: url.toString(),
      height: options.height,
      width: options.width,
    };

    return this;
  }

  /**
   * Adds a new field to this embed.
   * @param {StringResolvable} name The name of the field.
   * @param {StringResolvable | StringResolvable[]} value The field value.
   * @param {boolean} [inline=false] Whether this field is inline with others.
   */
  public addField(
    name: StringResolvable,
    value: StringResolvable | StringResolvable[],
    inline = false
  ): Embed {
    if (this.fields.length + 1 >= 25)
      throw new RangeError(
        "Embed#addField: Unable to add anymore fields, the max is 25."
      );

    value = Array.isArray(value) ? value.join("\n") : value.toString();

    this.fields.push({
      inline,
      value: value.toString(),
      name: name.toString(),
    });

    return this;
  }

  /**
   * Adds a new blank field.
   * @param {boolean} [inline=true] Whether this field should be inline with other fields.
   */
  public addBlankField(inline = false): Embed {
    return this.addField("\u200b", "\u200b", inline);
  }

  /**
   * Set the title of this embed.
   * @param {string} text The title text.
   */
  public setTitle(text: StringResolvable): Embed {
    this.title = text.toString();
    return this;
  }

  /**
   * Set the color of this embed.
   * @param {ColorResolvable} color The color of this embed.
   */
  public setColor(color: ColorResolvable): this {
    this.color = parseColor(color);
    return this;
  }

  /**
   * Set the author of this embed.
   * @param {string} name The author name.
   * @param {AuthorOptions} [opts={}] The author options.
   */
  public setAuthor(name: StringResolvable, opts: AuthorOptions = {}): this {
    this.author = {
      icon_url: opts.icon ? opts.icon.toString() : undefined,
      name: name.toString(),
      url: opts.url ? opts.url.toString() : undefined,
    };

    return this;
  }

  /**
   * Set the embed timestamp.
   * @param {number |Date} date The timestamp.
   */
  public setTimestamp(date: number | Date = new Date()): Embed {
    this.timestamp = date ? new Date(date).toISOString() : undefined;

    return this;
  }

  /**
   * Set the embed footer.
   * @param {string} text Footer text
   * @param {string | URL} icon The URL of footer icon (only supports http(s) and attachments)
   */
  public setFooter(
    text: StringResolvable,
    icon?: StringResolvable | URL
  ): Embed {
    this.footer = {
      icon_url: icon ? icon.toString() : undefined,
      text: text.toString(),
    };

    return this;
  }

  /**
   * Set the image of this embed.
   * @param {string | URL} url Source URL of image (only supports http(s) and attachments)
   * @param {ImageOptions} [options={}] Options for the image.
   */
  public setImage(url: string | URL, options: ImageOptions = {}): Embed {
    this.image = {
      url: url.toString(),
      height: options.height,
      width: options.width,
    };

    return this;
  }

  /**
   * Set the description of this embed.
   * @param {string} text The description content.
   */
  public setDescription(text: StringResolvable | StringResolvable[]): Embed {
    this.description = Array.isArray(text) ? text.join("\n") : text.toString();

    return this;
  }
}

export interface StringResolvable {
  toString(): string;
}

export interface AuthorOptions {
  url?: StringResolvable | URL;
  icon?: StringResolvable | URL;
}

export interface ImageOptions {
  height?: number;
  width?: number;
}
