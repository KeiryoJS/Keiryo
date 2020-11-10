/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../../abstract/Resource";

export class Relationship extends Resource {
  /**
   * @param {Client} client The client instance.
   * @param {Object} data The relationship data.
   */
  constructor(client, data) {
    super(client);

    /**
     * ID of the user this relationship is about.
     * @type {string}
     */
    this.id = data.id;

    /**
     * The user that this relationship is about.
     * @type {User}
     */
    this.user = this.client.users.add(data.user);

    this._patch(data);
  }

  /**
   * Removes this relationship.
   * @returns {Promise<Relationship>}
   */
  async remove() {
    await this.client.relationships.remove(this.id);
    return this;
  }

  /**
   * Updates this relationship
   * @param {Object} data The relationship data.
   * @return {Relationship}
   */
  _patch(data) {
    /**
     * The type of relationship this is.
     * @type {RelationshipType}
     */
    this.type = data.type;

    return this;
  }
}
