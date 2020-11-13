/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../../abstract/Resource";

export class Template extends Resource {
  /**
   *
   * @param {Client} client
   * @param {Object} data
   */
  constructor(client, data) {
    super(client);

    client.guilds.add(data.serialized_source_guild);

    /**
     * This templates code.
     * @type {string}
     */
    this.code = data.code;

    /**
     * The user who created this template.
     * @type {User}
     */
    this.creator = client.users.add(data.creator);

    /**
     * The guild that this template is based on.
     * @type {string}
     */
    this.guildId = data.source_guild_id;

    this._patch(data);
  }

  /**
   * The "ID" of this template.
   * @return {string}
   */
  get id() {
    return this.code;
  }

  /**
   * Updates this template with data from the guild.
   * @param {Object} data The template data.
   */
  _patch(data) {
    /**
     * The name of this template.
     * @type {string}
     */
    this.name = data.name;

    /**
     * The description of this template.
     * @type {string}
     */
    this.description = data.description ?? "";

    /**
     * Number of times this template has been used
     * @type {number}
     */
    this.usageCount = data.usage_count;

    /**
     * When this template was created
     * @type {number}
     */
    this.createdTimestamp = new Date(Date.parse(data.created_at)).getTime();

    /**
     * When this template was last synced to the source guild
     * @type {number}
     */
    this.updatedTimestamp = new Date(Date.parse(data.updated_at)).getTime();

    /**
     * Whether this template has un-synced changes
     * @type {*|boolean}
     */
    this.isDirty = data.is_dirty ?? false;

    return this;
  }
}
