/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { BaseManager } from "./BaseManager";
import { neo } from "../structures/Extender";
import { Cacheable } from "../util";

import type { Guild } from "../structures/guild/Guild";
import type { Cache, Client } from "../lib";

export class GuildManager extends BaseManager<Guild> {
  /**
   * The guilds cache.
   * @protected
   */
  public readonly cache: Cache<Guild>;

  /**
   * Creates a new instanceof GuildManager.
   * @param client The client instance.
   */
  public constructor(client: Client) {
    super(client, neo.get("Guild"));

    this.cache = client.caching.get(Cacheable.Guild, "guilds");
  }
}