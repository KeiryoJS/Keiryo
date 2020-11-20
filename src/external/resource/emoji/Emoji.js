/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../../abstract/Resource";
import { Snowflake } from "../../../utils";

export class Emoji extends Resource {
  constructor(client, data) {
    super(client);

    /**
     * The ID of this emoji.
     * @type {?string}
     */
    this.id = data.id;

    /**
     * The name of this emoji.
     * @type {string}
     */
    this.name = data.name;

    /**
     * Whether this emoji is animated.
     * @type {boolean}
     */
    this.animated = data.animated;

    /**
     * Whether this emoji has been deleted.
     * @type {boolean}
     */
    this.deleted = false;
  }

  /**
   * The identifier of this emoji.
   * @type {string}
   */
  get identifier() {
    if (this.id) {
      return `${this.animated ? "a" : ""}:${this.name}:${this.id}`;
    }

    return encodeURIComponent(this.name);
  }

  /**
   * The URL to this emoji, or null if this emoji is unicode.
   * @type {?string}
   */
  get url() {
    if (!this.id) {
      return null;
    }

    return this.client.rest.cdn.emoji(this.id, this.animated ? "gif" : "png");
  }

  /**
   * The timestamp the emoji was created at, or null if unicode
   * @type {?number}
   */
  get createdTimestamp() {
    return this.id ? Snowflake.deconstruct(this.id).timestamp : null;
  }

  /**
   * The time the emoji was created at, or null if unicode
   * @type {?Date}
   */
  get createdAt() {
    return this.id ? new Date(this.createdTimestamp) : null;
  }

  /**
   * The string representation of this emoji.
   * @return {string}
   */
  toString() {
    return this.id ? `${this.animated ? "a" : ""}:${this.name}:${this.id}` : this.name;
  }
}
