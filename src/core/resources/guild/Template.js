/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../Resource";

export class Template extends Resource {
  /**
   * @param {Client} client The client instance.
   * @param {Object} data The template data.
   */
  constructor(client, data) {
    super(client);

    client.guilds.add(data.serialized_source_guild);
    client.users.add(data.creator);

    /**
     * This template's code.
     *
     * @type {string}
     */
    this.code = data.code;

    /**
     * ID of the User who created this template.
     *
     * @type {string}
     */
    this.creatorId = data.creator_id;

    /**
     * ID of the Guild that this template is based on.
     *
     * @type {string}
     */
    this.guildId = data.source_guild_id;

    this._patch(data);
  }

  /**
   * This template's identifier (it's code).
   *
   * @returns {string}
   */
  get id() {
    return this.code;
  }

  /**
   * Date in which this template was created.
   *
   * @type {Date}
   */
  get createdAt() {
    return new Date(this.createdAtTimestamp);
  }

  /**
   * Date of the last time this template was synced to the source guild.
   *
   * @type {Date}
   */
  get updatedAt() {
    return new Date(this.updatedAtTimestamp);
  }

  /**
   * Returns the guild that this template is based on.
   *
   * @param options
   *
   * @returns {Promise<Guild>}
   */
  getGuild(options) {
    return this.client.guilds.get(this.guildId, options);
  }

  /**
   * Returns the User that created this template.
   *
   * @param options
   *
   * @returns {Promise<User>}
   */
  getCreator(options) {
    return this.client.users.get(this.creatorId, options);
  }

  /**
   * Updates this template with data from Discord.
   *
   * @param {Object} data The template data.
   *
   * @private
   */
  _patch(data) {
    /**
     * The name of this template.
     *
     * @type {string}
     */
    this.name = data.name;

    /**
     * Number of times this template has been used.
     *
     * @type {number}
     */
    this.usageCount = data.usage_count;

    /**
     * Timestamp of when this template was created.
     *
     * @type {number}
     */
    this.createdAtTimestamp = Date.parse(data.created_at);

    /**
     * Timestamp of when this template was last synced to the source guild.
     *
     * @type {number}
     */
    this.updatedAtTimestamp = Date.parse(data.updated_at);

    if ("description" in data) {
      /**
       * The description of this template.
       *
       * @type {?string}
       */
      this.description = data.description;
    }

    if ("is_dirty" in data) {
      /**
       * Whether this template has un-synced changes.
       *
       * @type {?boolean}
       */
      this.isDirty = data.is_dirty;
    }

    return this;
  }
}