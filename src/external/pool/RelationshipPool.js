/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Collection } from "../../utils";
import { ResourcePool } from "../abstract/ResourcePool";
import { resources } from "../resource/Resources";

export class RelationshipPool extends ResourcePool {
  /**
   * @param {Client} client The client.
   */
  constructor(client) {
    super(client, {
      limit: client.caching.limitFor("relationship"),
      class: resources.get("Relationship")
    });
  }

  /**
   * Removes a relationship with a user,
   * @param {UserLike} user The user that we have a relationship with.
   * @returns {boolean}
   */
  async remove(user) {
    const id = this.client.users.resolveId(user);
    if (!id) {
      throw new Error("Please provide a valid user.");
    }

    await this.client.rest.delete(`/users/@me/relationships/${id}`);
    return this.delete(id);
  }

  /**
   * Creates a new relationship.
   * @param {UserLike} user The user to create a relationship for.
   * @param {RelationshipType} type The relationship type.
   * @returns {Promise<Relationship>}
   */
  async create(user, type) {
    const id = this.client.users.resolveId(user);
    if (!id) {
      throw new Error("Please provide a valid user.");
    }

    const data = await this.client.rest.post(`/users/@me/relationships/${id}`, {
      body: { type }
    });

    return this.add(data);
  }

  /**
   * Fetches all relationships for the current user.
   * This method is only for user accounts or it will throw an error.
   * @param {boolean} [cache=true] Whether to cache the relationships.
   * @returns {Promise<RelationshipPool | Collection>}
   */
  async fetch(cache = true) {
    const rels = await this.client.rest.get("/users/@me/relationships"),
      col = cache ? this.cache : new Collection();

    for (const rel of rels) {
      const relationship = this._create(col);
      col.set(rel.id, relationship);
    }

    return cache ? this : col;
  }
}