/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ShardManager, ShardManagerOptions } from "@neocord/gateway";
import { API, APIOptions } from "@neocord/rest";
import { CacheManager, CacheOptions } from "./internal/CacheManager";

import { UserPool } from "../external/pool/UserPool";
import { GuildPool } from "../external/pool/GuildPool";

export class Client {
  /**
   * The user pool.
   *
   * @type {UserPool}
   */
  public readonly users: UserPool;

  /**
   * The guild pool.
   *
   * @type {GuildPool}
   */
  public readonly guilds: GuildPool;

  /**
   * The REST manager for communicating with Discords API.
   *
   * @type {API}
   * @private
   */
  readonly #rest: API;

  /**
   * The shard manager for internal sharding.
   *
   * @type {ShardManager}
   * @private
   */
  readonly #ws: ShardManager;

  /**
   * The cache manager for resource caching.
   *
   * @type {CacheManager}
   * @private
   */
  readonly #caching: CacheManager;

  /**
   * @param {ClientOptions} options The options for this instance.
   */
  public constructor(options: ClientOptions = {}) {
    this.#rest = new API(options.rest);
    this.#ws = new ShardManager(options.ws);
    this.#caching = new CacheManager(this, options.caching);

    this.users = new UserPool(this);
    this.guilds = new GuildPool(this);
  }

  /**
   * The REST manager for communicating with Discords API.
   *
   * @type {API}
   */
  public get rest(): API {
    return this.#rest;
  }

  /**
   * The shard manager for internal sharding.
   *
   * @type {ShardManager}
   */
  public get ws(): ShardManager {
    return this.#ws;
  }

  /**
   * The cache manager for resource caching.
   *
   * @type {CacheManager}
   */
  public get caching(): CacheManager {
    return this.#caching;
  }
}

interface ClientOptions {
  rest?: APIOptions;
  ws?: ShardManagerOptions;
  caching?: CacheOptions;
}
