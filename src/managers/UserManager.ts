/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { BaseManager } from "./BaseManager";
import { neo } from "../structures/Extender";
import { Cacheable } from "../util";

import type { RESTGetAPIUserResult } from "discord-api-types/default";
import type { User } from "../structures/other/User";
import type { Cache, Client } from "../lib";

export class UserManager extends BaseManager<User> {
  /**
   * The user cache.
   * @protected
   */
  public cache: Cache<User>;

  /**
   * Creates a new instanceof UserManager.
   * @param client The client instance.
   */
  public constructor(client: Client) {
    super(client, neo.get("User"));

    this.cache = client.caching.get(Cacheable.User);
  }

  /**
   * Fetches a user from the discord api.
   * @param id The ID of the user to fetch.
   */
  public async fetch(id: string): Promise<User> {
    const data = await this.client.api.get<RESTGetAPIUserResult>(`/users/${id}`);
    return this._add(data);
  }
}