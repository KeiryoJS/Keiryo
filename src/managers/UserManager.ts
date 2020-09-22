/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { BaseManager, BaseResolvable } from "./BaseManager";
import { neo } from "../structures/Extender";

import type { User } from "../structures/other/User";
import type { Client } from "../lib";
import { DiscordStructure } from "../util";

export class UserManager extends BaseManager<User> {
  /**
   * Creates a new instanceof UserManager.
   * @param {Client} client The client instance.
   */
  public constructor(client: Client) {
    super(client, neo.get("User"));
  }

  /**
   * The total amount of users that can be cached at one time.
   * @type {number}
   */
  public limit(): number {
    return this.client.data.limits.get(DiscordStructure.User) ?? Infinity;
  }

  /**
   * Fetches a user from the discord api.
   * @param {string} userId The ID of the user to fetch.
   * @returns {Promise<User>} The fetched user.
   */
  public async fetch(userId: string): Promise<User> {
    const _data = await this.client.api.get(`/users/${userId}`);
    return this._add(_data);
  }
}

export type UserResolvable = BaseResolvable<User>;
