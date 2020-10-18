/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { GatewayEvent, GatewayOpCode, Payload, Shard } from "@neocord/gateway";
import { Collection, isClass, List, mergeObjects, walk } from "@neocord/utils";
import { basename, join } from "path";
import { CacheManager, CacheOptions } from "./caching/CacheManager";

import type { Client } from "../Client";
import type { Handler } from "./Handler";

const packetWhitelist = [
  GatewayEvent.Ready,
  GatewayEvent.Resumed,
  GatewayEvent.GuildCreate,
  GatewayEvent.GuildDelete,
  GatewayEvent.GuildMembersChunk,
  GatewayEvent.GuildMemberAdd,
  GatewayEvent.GuildMemberRemove
];

const eventWhitelist = [
  GatewayEvent.Ready,
  GatewayEvent.Resumed,
  GatewayEvent.GuildCreate,
  GatewayEvent.GuildDelete
];

const DEFAULTS: DataOptions = {
  track: [],
  disabledEvents: []
};


export class DataHandler {
  /**
   * The event stats.
   *
   * @type {Record<number, Collection<GatewayEvent, number>>}
   */
  public stats!: Record<number, Collection<GatewayEvent, number>>;

  /**
   * The events to track, if any.
   * @type {Array<GatewayEvent> | "all"}
   */
  public track: GatewayEvent[] | "all";

  /**
   * All events that won't be handled.
   *
   * @type {List<GatewayEvent>}
   */
  public disabledEvents: List<GatewayEvent>;

  /**
   * The caching manager.
   *
   * @type {CacheManager}
   * @private
   */
  readonly #caching: CacheManager;

  /**
   * The packet handlers.
   *
   * @type {Collection}
   * @private
   */
  readonly #handlers: Collection<string, Handler>;

  /**
   * The packet queue.
   *
   * @type {Array<Payload<Dictionary[]>>}
   * @private
   */
  readonly #queue: Payload[];

  /**
   * The client instance.
   *
   * @type {Client}
   * @private
   */
  readonly #client: Client;

  /**
   * @param {Client} client The client instance.
   * @param {DataOptions} [options={}]
   */
  public constructor(client: Client, options: DataOptions = {}) {
    options = mergeObjects(options, DEFAULTS);

    this.#client = client;
    this.#queue = [];
    this.#handlers = new Collection();
    this.#caching = new CacheManager(this.#client, options.caching);

    this.disabledEvents = new List(options.disabledEvents ?? []);
    this.track = [];

    if (options.track) {
      this.stats = {};
      if (Array.isArray(options.track)) this.track = options.track;
      else this.track = "all";
    }

    this._handle = this._handle.bind(this);
  }

  /**
   * The caching manager.
   *
   * @type {2CacheManager}
   */
  public get caching(): CacheManager {
    return this.#caching;
  }

  /**
   * The loaded packet handlers.
   *
   * @type {Collection<string, Handler>}
   */
  public get handlers(): Collection<string, Handler> {
    return this.#handlers;
  }

  /**
   * Initializes the data handler.
   */
  public async init(): Promise<void> {
    await this._load();
    this.#client.on("raw", this._handle);
  }

  /**
   * Loads all handlers.
   *
   * @protected
   */
  protected async _load(): Promise<void> {
    const dir = join(__dirname, "handlers");
    for (const file of walk(dir)) {
      const imported = await import(file),
        Handler = "default" in imported
          ? imported.default
          : imported;

      if (!isClass(Handler)) {
        this.#client.emit("warn", `Built-in packet handler for ${basename(file)} doesn't return a class, this should be reported.`);
        continue;
      }

      const handler: Handler = new Handler(this.#client);
      this.#handlers.set(handler.name, handler);
    }
  }

  /**
   * @param {number} shard
   * @param {GatewayEvent} event
   *
   * @protected
   */
  protected _increment(shard: number, event: GatewayEvent): number {
    let stats = this.stats[shard];
    if (!stats) {
      this.stats[shard] = new Collection();
      stats = this.stats[shard];
    }

    const v = (stats.get(event) ?? 0) + 1;
    stats.set(event, v);

    return v;
  }

  /**
   * Handle a gateway event sent by discord.
   * @param {Payload} pk The payload.
   * @param {Shard} shard The shard the payload was sent to.
   *
   * @protected
   */
  protected async _handle(pk: Payload, shard: Shard): Promise<void> {
    if (pk.op !== GatewayOpCode.Dispatch) {
      return;
    }

    // (0) Check if tracking is enabled for this event.
    const event = pk.t as GatewayEvent;
    if (this.track === "all" || this.track.includes(event)) {
      this._increment(shard.id, event);
    }

    // (1) Check whether the sharding manager is ready.
    if (this.#client.ws.ready && !packetWhitelist.includes(event)) {
      this.#queue.push(pk);
      return;
    }

    // (2) Check if the event is disabled.
    if (!eventWhitelist.includes(event) && this.disabledEvents.has(event)) {
      return;
    }

    // (3) Check whether or not there's any packets in the queue.
    if (this.#queue.length) {
      const queued = this.#queue.shift() as Payload;
      setImmediate(() => this._handle(queued, shard));
    }

    // (4) Handle the packet.
    const handler = this.#handlers.get(event) as Handler;
    if (!handler) {
      this.#client.emit("debug", `(Packet Handling) ‹${event}› Handler missing.`);
      return;
    }

    try {
      await handler.handle(pk, shard);
    } catch (e) {
      this.#client.emit("error", e);
    }
  }
}

export interface DataOptions {
  /**
   * Events that wont be handled.
   * @type {Set<GatewayEvent> | GatewayEvent[]}
   */
  disabledEvents?: Set<GatewayEvent> | GatewayEvent[];

  /**
   * Tracks how many times a certain event is received.
   * @type {GatewayEvent[] | "all" | boolean}
   */
  track?: GatewayEvent[] | "all" | boolean;

  /**
   * Options for the caching manager.
   */
  caching?: CacheOptions;
}

