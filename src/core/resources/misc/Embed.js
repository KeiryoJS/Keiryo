/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { parseColor } from "../../../../../neocord/src";

export class Embed {
  /**
   * @param {Embed | Object} base
   */
  constructor(base = {}) {
    /**
     * The type of this embed, either:
     * - `rich` a rich embed
     * - `image` an image embed
     * - `video` a video embed
     * - `gifv` a gifv embed
     * - `article` an article embed
     * - `link` a link embed
     *
     * @type {string}
     */
    this.type = base.type || "rich";

    /**
     * The title of this embed
     * @type {?string}
     */
    this.title = base.title ?? null;

    /**
     * The description of this embed
     * @type {?string}
     */
    this.description = base.description ?? null;

    /**
     * The URL of this embed
     * @type {?string}
     */
    this.url = base.url ?? null;

    /**
     * The color of this embed
     * @type {?number}
     */
    this.color = base.color ? parseColor(base.color) : null;

    /**
     * The timestamp of this embed
     * @type {?number}
     */
    this.timestamp = base.timestamp ? new Date(base.timestamp).getTime() : null;

    /**
     * The fields of this embed
     * @type {EmbedField[]}
     */
    this.fields = base.fields ?? [];

    /**
     * The thumbnail of this embed (if there is one)
     * @type {?EmbedThumbnail}
     */
    this.thumbnail = base.thumbnail ?? null;

    /**
     * The image of this embed, if there is one
     * @type {?EmbedImage}
     */
    this.image = base.image ?? null;

    /**
     * The video of this embed (if there is one)
     * @type {?EmbedVideo}
     * @readonly
     */
    this.video = base.video ?? null;

    /**
     * The author of this embed (if there is one)
     * @type {?EmbedAuthor}
     */
    this.author = base.author ?? null;

    /**
     * The provider of this embed (if there is one)
     * @type {?EmbedProvider}
     */
    this.provider = base.provider ?? null;

    /**
     * The footer of this embed
     * @type {?EmbedFooter}
     */
    this.footer = base.footer ?? null;
  }


  /**
   * The embed color as a hex code.
   * @type {string}
   */
  get hex() {
    return this.color ? `#${this.color.toString(16).padStart(6, "0")}` : null;
  }

  /**
   * The accumulated length for the title, description, fields and footer text.
   * @type {number}
   */
  get length() {
    return (
      (this.title?.length ?? 0) +
      (this.description?.length ?? 0) +
      this.fields.reduce((l, f) => l + (f.name.length + f.value.length), 0) +
      (this.footer?.text?.length ?? 0)
    );
  }

  /**
   * Set the thumbnail of this embed.
   *
   * @param {string | URL} url The image url.
   * @param {ImageOptions} [options={}] The options for the image.
   *
   * @returns {Embed}
   */
  setThumbnail(url, options = {}) {
    this.thumbnail = {
      url: url.toString(),
      height: options.height,
      width: options.width
    };

    return this;
  }

  /**
   * Adds a new field to this embed.
   *
   * @param {StringResolvable} name The name of the field.
   * @param {StringResolvable | StringResolvable[]} value The field value.
   * @param {boolean} [inline=false] Whether this field is inline with others.
   *
   * @returns {Embed}
   */
  addField(name, value, inline = false) {
    if (this.fields.length + 1 >= 25) {
      throw new RangeError("Embed#addField: Unable to add anymore fields, the max is 25.");
    }

    value = Array.isArray(value) ? value.join("\n") : value.toString();

    this.fields.push({
      inline,
      value: value.toString(),
      name: name.toString()
    });

    return this;
  }

  /**
   * Adds a new blank field.
   *
   * @param {boolean} [inline=true] Whether this field should be inline with other fields.
   *
   * @returns {Embed}
   */
  addBlankField(inline = false) {
    return this.addField("\u200b", "\u200b", inline);
  }

  /**
   * Set the title of this embed.
   *
   * @param {string} text The title text.
   *
   * @returns {Embed}
   */
  setTitle(text) {
    this.title = text.toString();

    return this;
  }

  /**
   * Set the color of this embed.
   *
   * @param {ColorResolvable} color The color of this embed.
   *
   * @returns {Embed}
   */
  setColor(color) {
    this.color = parseColor(color);

    return this;
  }

  /**
   * Set the author of this embed.
   *
   * @param {string} name The author name.
   * @param {AuthorOptions} [options={}] The author options.
   *
   * @returns {Embed}
   */
  setAuthor(name, options = {}) {
    this.author = {
      icon_url: options.icon ? options.icon.toString() : undefined,
      name: name.toString(),
      url: options.url ? options.url.toString() : undefined
    };

    return this;
  }

  /**
   * Set the embed timestamp.
   *
   * @param {number |Date} date The timestamp.
   *
   * @returns {Embed}
   */
  setTimestamp(date = new Date()) {
    this.timestamp = date ? new Date(date).toISOString() : undefined;

    return this;
  }

  /**
   * Set the embed footer.
   *
   * @param {string} text Footer text
   * @param {string | URL} icon The URL of footer icon (only supports http(s) and attachments)
   *
   * @returns {Embed}
   */
  setFooter(text, icon) {
    this.footer = {
      icon_url: icon ? icon.toString() : undefined,
      text: text.toString()
    };

    return this;
  }

  /**
   * Set the image of this embed.
   *
   * @param {string | URL} url Source URL of image (only supports http(s) and attachments)
   * @param {ImageOptions} [options={}] Options for the image.
   *
   * @returns {Embed}
   */
  setImage(url, options = {}) {
    this.image = {
      url: url.toString(),
      height: options.height,
      width: options.width
    };

    return this;
  }

  /**
   * Set the description of this embed.
   *
   * @param {string} text The description content.
   *
   * @returns {Embed}
   */
  setDescription(text) {
    this.description = Array.isArray(text) ? text.join("\n") : text.toString();

    return this;
  }
}
/**
 * @typedef {Object} EmbedData
 * @property {string} [title] Title of the Embed.
 * @property {"rich"} [type] The type of Embed.
 * @property {string} [description] Description of the Embed.
 * @property {url} [string] URL of the Embed.
 * @property {number} [timestamp] Timestamp of Embed content.
 */

/**
 * @typedef {Object} EmbedFooter
 * @property {string} text
 * @property {string} [icon_url] URL of Footer icon (only supports http(s) and attachments).
 * @property {string} [proxy_icon_url] A proxied URL of the Footer icon.
 */

/**
 * @typedef {Object} EmbedField
 * @property {string} name The name of the Field.
 * @property {string} value The value of the Field.
 * @property {boolean} [inline] Whether or not this field should display inline with others.
 */

/**
 * @typedef {Object} EmbedImage Used for the EmbedImage and EmbedThumbnail
 * @property {string} [url]
 * @property {string} [proxy_url] The proxied URL of the image.
 * @property {number} [height] The height of the image.
 * @property {number} [width] The width of the image.
 */

/**
 * @typedef {Object} EmbedProvider
 * @property {string} [name] Name of provider.
 * @property {string} [url] URL of provider.
 */

/**
 * @typedef {Object} EmbedAuthor
 * @property {string} name Name of author.
 * @property {string} url Name of author.
 * @property {string} icon_url URL of Author icon (only supports http(s) and attachments).
 * @property {string} proxy_icon_url Proxied URL of the Author icon.
 */

/**
 * @typedef {Object} EmbedVideo
 * @property {string} [url] Source URL of the video.
 * @property {string} [proxy_url] A proxied URL of the video.
 * @property {number} [height} The height of the video.
 * @property {number} [width} The width of the video.
 */
