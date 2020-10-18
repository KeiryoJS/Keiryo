/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Collection } from "@neocord/utils";
import { ResourcePool, ResourceType } from "../abstract";
import { resources } from "../resource/Resources";

import type { APIUserRelationship, Relationship, RelationshipType } from "../resource/user/Relationship";
import type { Client } from "../../client";
import type { UserLike } from "./UserPool";

export class RelationshipPool extends ResourcePool<Relationship> {
  /**
   * @param {Client} client The client instance.
   */
  public constructor(client: Client) {
    super(client, {
      resource: ResourceType.Relationship,
      class: resources.get("Relationship")
    });
  }

  /**
   * Removes a relationship with a user,
   * @param {UserLike} user The user that we have a relationship with.
   *
   * @returns {boolean}
   */
  public async remove(user: UserLike): Promise<boolean> {
    const id = this.client.users.resolveId(user);
    if (id) {
      await this.client.rest.delete(`/users/@me/relationships/${id}`);
      this.cache.delete(id);
      return true;
    }

    throw new Error("Please provide a valid user.");
  }

  /**
   * Creates a new relationship.
   * @param {UserLike} user The user to create a relationship for.
   * @param {RelationshipType} type The relationship type.
   *
   * @returns {Promise<Relationship>}
   */
  public async add(user: UserLike, type: RelationshipType): Promise<Relationship> {
    const id = this.client.users.resolveId(user);
    if (!id) {
      throw new Error("Please provide a valid user.");
    }

    const data = await this.client.rest.post(`/users/@me/relationships/${id}`, {
      body: { type }
    });

    return this._add(data);
  }

  /**
   * Fetches all relationships for the current user and caches them.
   * @param {boolean} cache Whether to cache the relationships.
   *
   * @returns {Promise<RelationshipPool>}
   */
  public fetch(cache?: true): Promise<this>;

  /**
   * Fetches all relationships for the current user but doesn't cache them.
   * This method is only for user accounts or it will throw an error.
   * @param {boolean} cache Whether to cache the relationships.
   *
   * @returns {Promise<Collection>}
   */
  public fetch(cache: false): Promise<Collection<string, Relationship>>;

  /**
   * Fetches all relationships for the current user.
   * This method is only for user accounts or it will throw an error.
   * @param {boolean} [cache=true] Whether to cache the relationships.
   *
   * @returns {Promise<RelationshipPool | Collection>}
   */
  public async fetch(cache = true): Promise<this | Collection<string, Relationship>> {
    const data = await this.client.rest.get<APIUserRelationship[]>("/users/@me/relationships"),
      col = cache
        ? this.cache
        : new Collection<string, Relationship>();

    for (const _rel of data) {
      const relationship = this._create(col);
      col.set(_rel.id, relationship);
    }

    return cache ? this : col;
  }
}