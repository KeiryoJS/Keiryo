/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ResourceManager } from "./ResourceManager";
import resources from "../resources/Resources";

export class UserManager extends ResourceManager {
  /**
   * @param {Client} client
   */
  constructor(client) {
    super(client, resources.get("User"));
  }

  /**
   * Fetches a user from the Discord API.
   *
   * @param {string} id The ID of the User to fetch.
   * @param {FetchOptions} [options] The fetch options
   */
  async fetch(id, { force = false, cache = true } = {}) {
    // todo: check if the user is cached.
    const resource = await this.client.rest.queue(`/users/${id}`);
    return this.add(resource, cache);
  }
}
