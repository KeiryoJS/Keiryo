/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Emitter, Timers } from "../utils";

import { ShardManager } from "./gateway/ShardManager";
import { RestHandler } from "./rest/RestHandler";
import { CachingHelper } from "./CachingHelper";

import { UserPool } from "../external/pool/UserPool";
import { RelationshipPool } from "../external/pool/RelationshipPool";
import { resources } from "../external/resource/Resources";

export class Client extends Emitter {
  /**
   * The shard manager
   * @type {ShardManager}
   */
  #ws;

  /**
   * The REST Manager.
   * @type {RestHandler}
   */
  #rest;

  /**
   * The caching helper.
   * @type {CachingHelper}
   */
  #caching;

  /**
   * The current token.
   * @type {string}
   */
  #token;

  /**
   * @param {ClientOptions} options The options to use.
   */
  constructor(options = {}) {
    super();

    if (options.token) {
      this.#token = options.token;
    }

    this.#ws = new ShardManager(this, options.ws);
    this.#rest = new RestHandler(this, options.rest);
    this.#caching = new CachingHelper(options.caching);

    /**
     * The cached users.
     * @type {UserPool}
     */
    this.users = new UserPool(this);

    /**
     * All relationships for this user.
     * @type {RelationshipPool}
     */
    this.relationships = new RelationshipPool(this);
  }

  /**
   * The current token.
   * @return {string}
   */
  get token() {
    return this.#token;
  }

  /**
   * The shard manager.
   * @return {ShardManager}
   */
  get ws() {
    return this.#ws;
  }

  /**
   * The REST Manager.
   * @return {RestHandler}
   */
  get rest() {
    return this.#rest;
  }

  /**
   * The caching helper.
   * @return {CachingHelper}
   */
  get caching() {
    return this.#caching;
  }

  /**
   * Fetches the current logged in user.
   * @return {Promise<ClientUser>}
   */
  async fetchSelf() {
    const data = await this.rest.get("/users/@me");

    /**
     * The current user.
     * @type {ClientUser}
     */
    return this.user = new (resources.get("ClientUser"))(this, data);
  }

  /**
   * Connects to the discord gateway.
   * @param {string} token The token to use.
   * @return {Promise<Client>}
   */
  async connect(token = this.#token) {
    if (!token) {
      throw new Error("Client#Token was not provided. Please provide your token. \nhttps://discord.com/developers/applications/BOTID/bot\n");
    }

    this.#token = token;

    try {
      await this.#ws.connect();
      return this;
    } catch (e) {
      this.destroy();
      throw e;
    }
  }

  /**
   * Destroys the client.
   */
  destroy() {
    this.#ws.destroy();
    Timers.clear();
    this.#token = undefined;
  }
}

/**
 * @typedef {Object} ClientOptions
 * @property {string} [token] The token to use.
 * @property {RestOptions} [rest={}]
 * @property {ShardManagerOptions} [ws={}]
 * @property {CachingOptions} [caching={}]
 */
