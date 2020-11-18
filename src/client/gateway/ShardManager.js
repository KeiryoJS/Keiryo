/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Intents } from "@neocord/utils";

import { Shard } from "./Shard";
import { EventHandler } from "./events/EventHandler";
import {
  ClientEvent,
  Collection,
  Emitter,
  GatewayCloseCode,
  mergeObjects,
  ShardEvent,
  sleep,
  Status
} from "../../utils";

const unrecoverable = Object.values(GatewayCloseCode).slice(1),
  unresumable = [ 1000, 4006, GatewayCloseCode.INVALID_SESSION ];

/**
 * @type {ShardManagerOptions}
 */
const defaults = {
  compression: false,
  useEtf: false,
  shards: "auto",
  version: 8,
  intents: Intents.DEFAULT,
  properties: {
    $browser: "neocord",
    $device: "neocord",
    $os: process.platform
  },
  url: "auto",
  guildSubscriptions: true,
  disabledEvents: [],
  track: []
};

export class ShardManager extends Emitter {
  /**
   * All shards that are currently spawned.
   * @type {Collection<string, Shard>}
   * @readonly
   */
  shards;

  /**
   * The session start limit.
   * @type {Object}
   */
  #limit;

  /**
   * The shard connect queue.
   * @type {Set<Shard>}
   */
  #queue;

  /**
   * The total amount of shards to spawn.
   * @type {number}
   */
  #shards;

  /**
   * @param {Client} client
   * @param {ShardManagerOptions} options
   */
  constructor(client, options = {}) {
    options = mergeObjects(options, defaults);
    super();

    this.shards = new Collection();

    /**
     * The options provided to the shard manager.
     * @type {ShardManagerOptions}
     */
    this.options = options;

    /**
     * The event handler.
     * @type {EventHandler}
     */
    this.events = new EventHandler(this);

    /**
     * The client instance.
     * @type {Client}
     * @readonly
     */
    this.client = client;

    /**
     * The compression to use.
     * @type {CompressionPackage | boolean}
     */
    this.compression = options.compression === true ? "zlib" : (options.compression ?? false);

    /**
     * Whether the manager is destroyed.
     * @type {boolean}
     */
    this.destroyed = false;

    /**
     * Whether some shards are reconnecting.
     * @type {boolean}
     */
    this.reconnecting = false;

    /**
     * Whether all shards are ready.
     * @type {boolean}
     */
    this.ready = false;
  }

  /**
   * The intents that this bot is using.
   * @return {number}
   */
  get intents() {
    if (this.options.intents instanceof Intents) {
      return this.options.intents.bitmask;
    }

    return this.options.intents.valueOf() ?? Intents.DEFAULT;
  }

  /**
   * The average latency across all shards.
   * @type {number}
   */
  get latency() {
    return this.shards.reduce((lat, shard) => lat + shard.latency, 0) / this.shards.size;
  }

  /**
   * The bot token.
   * @return {?string}
   */
  get token() {
    return this.client.token;
  }

  /**
   * The number of spawned shards.
   * @return {number}
   */
  get shardCount() {
    return this.#shards;
  }

  /**
   * Destroys all shards.
   */
  destroy() {
    if (!this.destroyed) {
      return;
    }

    this._debug(`Destroying... Called by:\n${new Error().stack}`);
    this.destroyed = true;
    this.#queue.clear();

    for (const shard of this.shards.values()) {
      shard.destroy({
        reset: true,
        emit: false,
        log: false,
        code: 1000
      });
    }
  }

  /**
   * Connects all shards.
   * @return {Promise<void>}
   */
  async connect() {
    await this.events.init();

    /* Step 0 - Configure gateway stuff. */
    const {
      url,
      shards: shardCount,
      session_start_limit: startLimit
    } = await this._fetchSession();

    const { remaining, reset_after, total } = startLimit;
    this._debug(`Fetched Gateway Info: Url = ${url}, Shards = ${shardCount}`);
    this._debug(`Session Start Info: Total = ${total}, Remaining = ${remaining}`);

    /**
     * The Gateway URL to use.
     * @type {string}
     */
    this.gatewayUrl = this.options.url !== "auto" && this.options.url
      ? this.options.url
      : url;

    /* Step 1 - Configure Sharding Options. */
    let shards = [];
    if (Array.isArray(this.options.shards)) {
      if (!this.options.shardCount) {
        throw new TypeError("\"shardCount\" must be supplied if you are defining \"shards\" with an array.");
      }

      shards.push(...this.options.shards.filter(s => !Number.isNaN(s)));
    } else {
      const length = this.options.shards === "auto"
        ? this.options.shardCount = shardCount
        : this.options.shards = this.options.shardCount;

      shards = Array.from({ length }, (_, i) => i);
    }

    this._debug(`Spawning Shards: ${shards.join(", ")}`);

    /* Step 2 - Finalize */
    this.#limit = startLimit;
    this.#shards = shards.length;
    this.#queue = new Set(shards.map(id => new Shard(this, id)));

    const e = this.useEtf ? "ETF" : "JSON",
      c = this.compression ? `the '${this.compression}' module for zlib` : "no";

    this._debug(`Using ${e} encoding and ${c} compression.`);

    /* Step 3 - Handle the start limit and start spawning shards. */
    await this._handleLimit(remaining, reset_after);
    await this._spawnNext();
  }

  /**
   * Handles the session start limit for internalized sharding.
   * @param {number} [remaining]
   * @param {number} [resetAfter]
   * @private
   */
  async _handleLimit(remaining, resetAfter) {
    if (remaining === undefined && resetAfter === undefined) {
      const { session_start_limit: limit } = await this._fetchSession();

      this.#limit = limit;
      remaining = limit.remaining;
      resetAfter = limit.reset_after;

      this._debug(`Session Limit Info: Total = ${limit.total}, Remaining = ${limit.remaining}`);
    }

    if (!remaining) {
      this._debug(`Exceeded identify threshold. Attempting a connecting in ${resetAfter}ms`);
      await sleep(resetAfter);
    }
  }

  /**
   * Spawns the next shard in the queue.
   * @return {Promise<boolean>}
   * @private
   */
  async _spawnNext() {
    if (!this.#queue.size) {
      return true;
    }

    const [ shard ] = this.#queue;
    this.#queue.delete(shard);

    if (!shard.managed) {
      shard.on("fullReady", (guilds) => {
        this.client.emit(ClientEvent.SHARD_READY, shard, guilds);
        if (!this.#queue.size) {
          this.reconnecting = false;
        }

        this._checkShards();
      });

      shard.on(ShardEvent.CLOSE, (evt) => {
        if (evt.code === 1000 ? this.destroyed : unrecoverable.includes(evt.code)) {
          this.client.emit(ClientEvent.SHARD_DISCONNECT, shard, evt);
          this._debug(`Close Reason: ${GatewayCloseCode[evt.code]}`, shard);
          return;
        }

        if (unresumable.includes(evt.code)) {
          shard.session.reset();
        }

        this.client.emit(ClientEvent.SHARD_RECONNECTING, shard);
        this.#queue.add(shard);

        if (shard.session.id) {
          this._debug(`Session ID is present, attempting to reconnect.`, shard);
          this._reconnect(true);
        } else {
          shard.destroy({ reset: true, emit: false, log: false });
          this._reconnect(true);
        }
      });

      shard.on(ShardEvent.INVALID_SESSION, () => {
        this.client.emit(ClientEvent.SHARD_RECONNECTING, shard);
      });

      shard.on(ShardEvent.DESTROYED, () => {
        this._debug("Destroyed, but no connection was present... Reconnecting", shard);
        this.client.emit(ClientEvent.SHARD_RECONNECTING, shard);

        this.#queue.add(shard);
        this._reconnect(true);
      });

      shard.managed = true;
    }

    this.shards.set(shard.id, shard);
    try {
      await shard.connect();
    } catch (e) {
      console.log(e);
      if (e && e.code && unrecoverable.includes(e.code)) {
        throw new Error(`WebSocket Closed: ${GatewayCloseCode[e.code]}`);
      } else if (!e || e.code) {
        this._debug("Failed to connect, reconnecting", shard);
        this.#queue.add(shard);
      } else {
        throw e;
      }
    }

    if (this.#queue.size) {
      this._debug(`Queue Size: ${this.#queue.size}, spawning next shard in 5 seconds.`);

      await sleep(5000);
      await this._handleLimit();
      await this._spawnNext();
    }

    return true;
  }

  _checkShards() {
    if (this.ready || this.shards.size !== this.#shards) {
      return;
    }

    this.ready = true;
    this.client.emit(ClientEvent.READY);
  }

  /**
   * Reconnects all queued shards.
   * @param {boolean} [skipLimit=false] Whether to skip the session limit.
   * @private
   */
  async _reconnect(skipLimit = false) {
    if (this.reconnecting || this.status !== Status.READY) {
      return false;
    }

    this.reconnecting = true;
    try {
      if (!skipLimit) {
        await this._handleLimit();
      }

      await this._spawnNext();
    } catch (e) {
      this._debug(`Couldn't connect or fetch session information. ${e.message}`);
      if (e.status !== 401) {
        this._debug("Possible network error occurred. Retrying in 5 seconds.");

        await sleep(5000);
        this.reconnecting = false;
        return this._reconnect(skipLimit);
      }

      if (this.client.listenerCount(ClientEvent.INVALIDATED)) {
        this.client.emit(ClientEvent.INVALIDATED);
        this.destroy();
      } else {
        this.client.destroy();
      }
    } finally {
      this.reconnecting = false;
    }

    return true;
  }

  /**
   * Fetch the session information for the bot.
   * @return {Promise<Dictionary>}
   * @private
   */
  _fetchSession() {
    return this.client.rest.get("/gateway/bot");
  }

  /**
   * Used for debugging shit.
   * @param {string} message The debug message.
   * @param {Shard} [shard] The shard
   * @private
   */
  _debug(message, shard) {
    const identifier = shard ? `(Shard ${shard.id})` : "(Manager)";
    return this.client.emit("debug", `${identifier} ${message.trim()}`);
  }
}

/**
 * @typedef {EventHandlerOptions} ShardManagerOptions
 * @property {number | number[] | "auto"} [shards]
 * @property {number | null} [shardCount] The amount of shards to spawn.
 * @property {CompressionPackage | boolean} [compression] Whether to use zlib compression, or the name of the package to use.
 * @property {boolean} [useEtf] Whether to use etf encoding, must have "etf.js" installed.
 * @property {number | Intents} [intents] The intents to use.
 * @property {"auto" | string} [url="auto"] The gateway url to use. Defaults to "auto"
 * @property {number} [version=8] The gateway version to use.
 * @property {Properties} [properties] The device properties.
 * @property {boolean} [guildSubscriptions] Whether to use guild subscriptions.
 */

/**
 * @typedef {Object} Properties
 * @property {string} $device The device name.
 * @property {string} $browser The browser name.
 * @property {string} $os The OS
 */
