/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Collection, Endpoint, EventEmitter, Intents, mergeObject } from "../common";
import { Shard } from "./shard/Shard";
import { GatewayOp, ShardManagerEvent } from "./constants";
import { ConcurrentConnectQueue } from "./connect";
import { ConsecutiveConnectQueue } from "./connect/ConsecutiveConnectQueue";

export class ShardManager extends EventEmitter {
  static NON_READY_WHITELIST = [
    "READY",
    "RESUMED",
    "GUILD_CREATE",
    "GUILD_DELETE",
    "GUILD_MEMBERS_CHUNK",
    "GUILD_MEMBER_ADD",
    "GUILD_MEMBER_REMOVE"
  ];

  static EVENT_WHITELIST = [
    "READY",
    "RESUMED",
    "GUILD_CREATE",
    "GUILD_DELETE"
  ];

  /**
   * The default options for the ShardManager.
   * @type {ShardManagerOptions}
   */
  static DEFAULT_OPTIONS = {
    compress: false,
    encoding: "json",
    gatewayUrl: "auto",
    gatewayVersion: 8,
    intents: Intents.DEFAULT,
    shardCount: "auto",
    properties: {
      $device: "neocord",
      $browser: "neocord",
      $os: process.platform
    },
    disabledEvents: []
  };

  /**
   * @param {REST} rest The REST handler.
   * @param {ShardManagerOptions} [options]
   */
  constructor(rest, options = {}) {
    options = mergeObject(options, ShardManager.DEFAULT_OPTIONS);
    super();

    // check for invalid gateway versions.
    if (![ 8, 7, 6 ].includes(options.gatewayVersion)) {
      throw new RangeError(`Invalid gateway version "${options.gatewayVersion}", you can only choose 8 (recommended), 7, and 6.`);
    }

    /**
     * The REST handler.
     * @type {REST}
     * @readonly
     */
    this.rest = rest;

    /**
     * The spawned shards.
     * @type {Collection<number, Shard>}
     * @readonly
     */
    this.shards = new Collection();

    /**
     * The options provided to us.
     * @type {ShardManagerOptions}
     * @readonly
     */
    this.options = options;

    /**
     * Whether we're ready.
     * @type {boolean}
     */
    this.ready = false;
  }

  /**
   * The average latency across all shards.
   * @returns {number}
   */
  get latency() {
    return this.shards.reduce((latency, shard) => latency + shard.latency, 0) / this.shards.size;
  }

  /**
   * The total number of shards to spawn.
   * @returns {number}
   */
  get shardCount() {
    return this._shardCount;
  }

  /**
   * The intents to be used.
   * @type {Intents}
   */
  get intents() {
    return new Intents(this.options.intents);
  }

  /**
   * The compression to use.
   * @type {DecompressionMethod | null}
   */
  get compression() {
    return typeof this.options.compress === "boolean"
      ? this.options.compress ? "zlib" : null
      : this.options.compress ?? null;
  }

  /**
   * The payload encoding to use.
   * @type {EncodingType}
   */
  get encoding() {
    return this.options.encoding;
  }

  /**
   * Connects all shards.
   */
  async connect(token) {
    this.token = token;

    const { url, shards, session_start_limit: limit } = await this.fetchGateway();

    /**
     * The total number of identify requests that can be made in a 5 second time span.
     * @private
     */
    this._maxConcurrency = limit.max_concurrency;

    /**
     * The queue used to connect shards.
     * @type {ConnectQueue}
     * @private
     */
    this._queue = this._maxConcurrency > 1
      ? new ConcurrentConnectQueue(this, this._maxConcurrency)
      : new ConsecutiveConnectQueue(this);

    /**
     * The gateway url to use.
     * @type {string}
     */
    this.gatewayUrl = this.options.gatewayUrl === "auto"
      ? url
      : this.options.gatewayUrl ?? url;

    /**
     * The total number of shards being spawned.
     * @type {number|*}
     * @private
     */
    this._shardCount = +this.options.shardCount || shards;
    if (this._shardCount < shards) {
      this._debug("Configured shard count is lower than the recommended.");
    }

    // log basic info
    this._debug(`data info, encoding = ${this.encoding}; decompression = ${this.compression}`);
    this._debug(`connection info, url = ${this.gatewayUrl}; shardCount = ${this._shardCount}; max concurrency = ${this._maxConcurrency}`);

    // queues all shards.
    const queue = Array.from({ length: this._shardCount }, (_, i) => new Shard(this, i).init(token));
    for (const shard of queue) {
      this._queue.add(shard);
    }

    await this._queue.connect();
  }

  /**
   * Sends a command through each shard.
   *
   * @param {GatewayOp} op The operation code.
   * @param {any} data The command data.
   *
   * @return {ShardManager}
   */
  broadcastCommand(op, data) {
    for (const [ , shard ] of this.shards) {
      shard.sendCommand({ op, d: data });
    }

    return this;
  }

  /**
   * Handles payloads received from each shard.
   * @param {DiscordPayload} payload The received payload,
   * @param {Shard} shard The shard that received this payload,
   */
  handlePayload(payload, shard) {
    if (payload.op !== GatewayOp.DISPATCH) {
      return;
    }

    this.emit("raw", payload, shard);
  }

  /**
   * Used for fetching the gateway information.
   */
  fetchGateway() {
    return this.rest.queue(Endpoint.GATEWAY);
  }

  /**
   * Checks all shards.
   */
  _checkShards() {
    if (this.shards.size ^ this._shardCount || this.ready) {
      return;
    }

    this.ready = true;
    this.emit(ShardManagerEvent.READY);
  }

  /**
   * Used for general debugging.
   * @param {string} message The debug message.
   * @param {number} [shard] The shard that is calling this method
   */
  _debug(message, shard) {
    this.emit(ShardManagerEvent.DEBUG, `(${shard !== void 0 ? `shard ${shard}` : "manager"}) ${message.trim()}`);
  }
}

/**
 * @typedef {Object} ShardManagerOptions
 * @property {DecompressionMethod | boolean} [compress] Whether or not to compress using zlib.
 * @property {EncodingType} [encoding] The payload encoding to use.
 * @property {number | "auto"} [shardCount] The total number of shards to spawn, or "auto" to use the recommended shard count from Discord.
 * @property {Intents | number} [intents] The intents to use.
 * @property {GatewayVersion} [gatewayVersion] The gateway version to use, v8 being the recommended and default.
 * @property {string | "auto"} [gatewayUrl] The gateway url to use, or "auto" to use the URL discord provides.
 * @property {DiscordProperties} [properties] The connection properties.
 * @property {string[]} [disabledEvents] Events that won't be emitted, pair this along with intents.
 */
