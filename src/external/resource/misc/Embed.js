/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { parseColor } from "../../../utils";
import { URL } from "url";

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
    this.type = data.type || "rich";

    /**
     * The title of this embed
     * @type {?string}
     */
    this.title = data.title ?? null;

    /**
     * The description of this embed
     * @type {?string}
     */
    this.description = data.description ?? null;

    /**
     * The URL of this embed
     * @type {?string}
     */
    this.url = data.url ?? null;

    /**
     * The color of this embed
     * @type {?number}
     */
    this.color = "color" in data ? parseColor(data.color) : null;

    /**
     * The timestamp of this embed
     * @type {?number}
     */
    this.timestamp = "timestamp" in data ? new Date(data.timestamp).getTime() : null;

    /**
     * The fields of this embed
     * @type {EmbedField[]}
     */
    this.fields = data.fields ?? [];

    /**
     * The thumbnail of this embed (if there is one)
     * @type {?EmbedThumbnail}
     */
    this.thumbnail = data.thumbnail ?? null;

    /**
     * The image of this embed, if there is one
     * @type {?EmbedImage}
     */
    this.image = data.image ?? null;

    /**
     * The video of this embed (if there is one)
     * @type {?EmbedVideo}
     * @readonly
     */
    this.video = data.video ?? null;

    /**
     * The author of this embed (if there is one)
     * @type {?EmbedAuthor}
     */
    this.author = data.author ?? null;

    /**
     * The provider of this embed (if there is one)
     * @type {?EmbedProvider}
     */
    this.provider = data.provider ?? null;

    /**
     * The footer of this embed
     * @type {?EmbedFooter}
     */
    this.footer = data.footer ?? null;
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
   * @param {string | URL} url The image url.
   * @param {ImageOptions} [options={}] The options for the image.
   * @returns {Embed}
   */
  setThumbnail(
    url,
    options = {}
  ) {
    this.thumbnail = {
      url: url.toString(),
      height: options.height,
      width: options.width
    };

    return this;
  }

  /**
   * Adds a new field to this embed.
   * @param {StringResolvable} name The name of the field.
   * @param {StringResolvable | StringResolvable[]} value The field value.
   * @param {boolean} [inline=false] Whether this field is inline with others.
   * @returns {Embed}
   */
  addField(
    name,
    value,
    inline = false
  ) {
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
   * @param {boolean} [inline=true] Whether this field should be inline with other fields.
   * @returns {Embed}
   */
  addBlankField(inline = false) {
    return this.addField("\u200b", "\u200b", inline);
  }

  /**
   * Set the title of this embed.
   * @param {string} text The title text.
   * @returns {Embed}
   */
  setTitle(text) {
    this.title = text.toString();
    return this;
  }

  /**
   * Set the color of this embed.
   * @param {ColorResolvable} color The color of this embed.
   * @returns {Embed}
   */
  setColor(color) {
    this.color = parseColor(color);
    return this;
  }

  /**
   * Set the author of this embed.
   * @param {string} name The author name.
   * @param {AuthorOptions} [opts={}] The author options.
   * @returns {Embed}
   */
  setAuthor(name, opts = {}) {
    this.author = {
      icon_url: opts.icon ? opts.icon.toString() : undefined,
      name: name.toString(),
      url: opts.url ? opts.url.toString() : undefined
    };

    return this;
  }

  /**
   * Set the embed timestamp.
   * @param {number |Date} date The timestamp.
   * @returns {Embed}
   */
  setTimestamp(date = new Date()) {
    this.timestamp = date ? new Date(date).toISOString() : undefined;

    return this;
  }

  /**
   * Set the embed footer.
   * @param {string} text Footer text
   * @param {string | URL} icon The URL of footer icon (only supports http(s) and attachments)
   * @returns {Embed}
   */
  setFooter(
    text,
    icon
  ) {
    this.footer = {
      icon_url: icon ? icon.toString() : undefined,
      text: text.toString()
    };

    return this;
  }

  /**
   * Set the image of this embed.
   * @param {string | URL} url Source URL of image (only supports http(s) and attachments)
   * @param {ImageOptions} [options={}] Options for the image.
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
   * @param {string} text The description content.
   * @returns {Embed}
   */
  setDescription(text) {
    this.description = Array.isArray(text) ? text.join("\n") : text.toString();

    return this;
  }
}

/**
 * @typedef {*} StringResolvable
 * @property {Function} toString
 */

/**
 * Represents an Embed Field
 * @typedef {Object} EmbedField
 * @property {string} name The name of this field
 * @property {string} value The value of this field
 * @property {boolean} inline If this field will be displayed inline
 */

/**
 * Represents the image of an Embed
 * @typedef {Object} EmbedImage
 * @property {string} url URL for this image
 * @property {string} proxyURL ProxyURL for this image
 * @property {number} height Height of this image
 * @property {number} width Width of this image
 */

/**
 * Represents the video of an Embed
 * @typedef {Object} EmbedVideo
 * @property {string} url URL of this video
 * @property {string} proxyURL ProxyURL for this video
 * @property {number} height Height of this video
 * @property {number} width Width of this video
 */

/**
 * Represents the author field of an Embed
 * @typedef {Object} EmbedAuthor
 * @property {string} name The name of this author
 * @property {string} url URL of this author
 * @property {string} iconURL URL of the icon for this author
 * @property {string} proxyIconURL Proxied URL of the icon for this author
 */

/**
 * Represents the provider of an Embed
 * @typedef {Object} EmbedProvider
 * @property {string} name The name of this provider
 * @property {string} url URL of this provider
 */

/**
 * Represents the footer field of a Embed
 * @typedef {Object} EmbedFooter
 * @property {string} text The text of this footer
 * @property {string} iconURL URL of the icon for this footer
 * @property {string} proxyIconURL Proxied URL of the icon for this footer
 */

/**
 * Represents the thumbnail of an Embed
 * @typedef {Object} EmbedThumbnail
 * @property {string} url URL for this thumbnail
 * @property {string} proxyURL ProxyURL for this thumbnail
 * @property {number} height Height of this thumbnail
 * @property {number} width Width of this thumbnail
 */

