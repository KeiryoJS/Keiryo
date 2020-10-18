/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ResourceLike, ResourcePool } from "../abstract/ResourcePool";
import { ResourceType } from "../abstract/ResourceType";
import { resources } from "../resource/Resources";

import type { APIUser } from "discord-api-types";
import type { User } from "../resource/user/User";
import type { Client } from "../../client";

export class UserPool extends ResourcePool<User> {
  /**
   * @param {Client} client The client instance.
   */
  public constructor(client: Client) {
    super(client, {
      class: resources.get("User"),
      resource: ResourceType.User
    });
  }

  /**
   * Fetches a user from the API.
   * @param {string} id ID of the user to fetch.
   * @param {boolean} [cache=true] Whether to cache the fetched user.
   *
   * @returns {Promise<User>}
   */
  public async fetch(id: string, cache = true): Promise<User> {
    const resource = await this.client.rest.get<APIUser>(`/users/${id}`),
      user = this._create(resource);

    if (cache) {
      this._set(user);
    }

    return user;
  }
}

export type UserLike = ResourceLike<User>
