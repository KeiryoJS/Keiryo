import { Resource, ResourceType } from "../../abstract";
import { UncachedResourceError } from "../../../utils";

import type { APIUser } from "discord-api-types";
import type { Client } from "../../../client";
import type { User } from "./User";

export class Relationship extends Resource {
  /**
   * ID of the user this relationship is about.
   *
   * @type {string}
   */
  public readonly id: string;

  /**
   * The type of relationship this is.
   *
   * @type {RelationshipType}
   */
  public type!: RelationshipType;

  /**
   * @param {Client} client The client instance.
   * @param {APIUserRelationship} data The relationship data.
   */
  public constructor(client: Client, data: APIUserRelationship) {
    super(client);

    this.id = data.id;

    this.client.users["_add"](data.user);
    this._patch(data);
  }

  /**
   * The user that this relationship is about.
   *
   * @type {User}
   */
  public get user(): User {
    const user = this.client.users.cache.get(this.id);
    if (!user) {
      throw new UncachedResourceError(ResourceType.User, `ID: ${this.id}`);
    }

    return user;
  }

  /**
   * Removes this relationship.
   *
   * @returns {Promise<Relationship>}
   */
  public async remove(): Promise<this> {
    await this.client.relationships.remove(this.id);
    return this;
  }

  /**
   * Updates this relationship with data from the API.
   * @param {APIUserRelationship} data
   *
   * @protected
   */
  protected _patch(data: APIUserRelationship): this {
    this.type = data.type;
    return this;
  }
}

export enum RelationshipType {
  Friend,
  Block,
  IncomingFriendRequest,
  OutgoingFriendRequest
}

export interface APIUserRelationship {
  id: string;
  type: RelationshipType;
  nickname: null;
  user: APIUser;
}
