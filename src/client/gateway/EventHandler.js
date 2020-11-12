/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { basename, join } from "path";
import { isClass, Timers, walk } from "@neocord/utils";
import { GatewayOp } from "../../utils";

const packetWhitelist = [
  "READY",
  "RESUMED",
  "GUILD_CREATE",
  "GUILD_DELETE",
  "GUILD_MEMBERS_CHUNK",
  "GUILD_MEMBER_ADD",
  "GUILD_MEMBER_REMOVE",
];

const eventWhitelist = [
  "READY",
  "RESUMED",
  "GUILD_CREATE",
  "GUILD_DELETE",
  "MESSAGE_CREATE",
];

export class EventHandler {
  /**
   * The packet queue.
   * @type {DiscordPacket[]}
   */
  #queue = [];

  /**
   * @param {ShardManager} manager The shard manager.
   */
  constructor(manager) {
    /**
     * The shard manager.
     * @type {ShardManager}
     */
    this.manager = manager;

    /**
     * The event handlers.
     * @type {Map<string, Event>}
     */
    this.handlers = new Map();

    /**
     * The track options.
     * @type {string[] | "all"}
     */
    this.track = [];
    if (this.options.track) {
      /**
       * The event stats.
       * @type {Record<number, Map<string, number>>}
       */
      this.stats = {};
      if (Array.isArray(this.options.track)) {
        this.track = this.options.track;
      } else {
        this.track = "all";
      }
    }

    /**
     * Events that are disabled by the user.
     * @type {Set<GatewayEvent>}
     */
    this.disabledEvents = new Set(this.options.disabledEvents);
  }

  /**
   * The client instance.
   * @return {Client}
   */
  get client() {
    return this.manager.client;
  }

  /**
   * The options for events.
   * @type {EventHandlerOptions}
   */
  get options() {
    return {
      track: this.manager.options.track,
      disabledEvents: this.manager.options.disabledEvents,
    };
  }

  /**
   * Initialize the event handling.
   */
  async init() {
    await this._load();
    this.manager.on("raw", (pak, shard) => {
      if (pak.op !== GatewayOp.DISPATCH) {
        return;
      }

      // (0) Check if tracking is enabled for this event.
      const event = pak.t;
      if (this.track === "all" || this.track.includes(event)) {
        this._increment(shard.id, event);
      }

      return this._handle(pak, shard);
    });
  }

  /**
   * Handles a discord packet.
   * @param {DiscordPacket} pak The packet.
   * @param {Shard} shard The shard.
   * @private
   */
  async _handle(pak, shard) {
    const event = pak.t;

    /* Step 0 - Check whether the sharding manager is ready. */
    if (!this.client.ws.ready && !packetWhitelist.includes(event)) {
      this.#queue.push(pak);
      return;
    }

    /* Step 1 - Check if the event is disabled. */
    if (!eventWhitelist.includes(event) && this.disabledEvents.has(event)) {
      return;
    }

    /* Step 2 - Check whether or not there's any packets in the queue. */
    if (this.#queue.length) {
      const queued = this.#queue.shift();
      setImmediate(() => this._handle(queued, shard));
    }

    /* Step 3 - Handle the packet. */
    const handler = this.handlers.get(event);
    if (!handler) {
      // this.client.emit("debug", `(Packet Handling) ‹${event}› Handler missing.`);
      return;
    }

    try {
      await handler.handle(pak, shard);
      // this.client.emit("debug", `(Packet Handling) ‹${event}› Ran successfully.`);
    } catch (e) {
      this.client.emit("error", e);
    }
  }

  /**
   * Increments an event stat.
   * @param {number} shard
   * @param {GatewayEvent} event
   * @protected
   */
  _increment(shard, event) {
    let stats = this.stats[shard];
    if (!stats) {
      this.stats[shard] = new Map();
      stats = this.stats[shard];
    }

    const v = (stats.get(event) ?? 0) + 1;
    stats.set(event, v);

    return v;
  }

  /**
   * Loads all event handlers.
   * @return {Promise<void>}
   * @private
   */
  async _load() {
    const dir = join(__dirname, "events");
    for (const file of walk(dir)) {
      const imported = await import(file),
        Handler = "default" in imported ? imported.default : imported;

      if (!isClass(Handler)) {
        this.client.emit(
          "warn",
          `(Packet Handling) Built-in packet handler for ${basename(
            file
          )} doesn't return a class, this should be reported.`
        );
        continue;
      }

      const handler = new Handler(this.client);
      this.handlers.set(handler.name, handler);
    }
  }
}

/**
 * @typedef {Object} EventHandlerOptions
 * @property {GatewayEvent | "all"} [track]
 * @property {GatewayEvent[]} [disabledEvents]
 */
