/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import {
  GatewayEvent,
  GatewayOpCode,
  Payload,
  Shard,
  SMEvent,
} from "@neocord/gateway";
import { Class, Collection, isClass, mergeObjects, walk } from "@neocord/utils";
import { basename, join } from "path";
import { CachingManager, CachingOptions } from "./CachingManager";
import { Janitor, JanitorJobs } from "./janitor/Janitor";

import type { Client } from "../Client";
import type { Handler } from "./Handler";

const packetWhitelist = [
  GatewayEvent.Ready,
  GatewayEvent.Resumed,
  GatewayEvent.GuildCreate,
  GatewayEvent.GuildDelete,
  GatewayEvent.GuildMembersChunk,
  GatewayEvent.GuildMemberAdd,
  GatewayEvent.GuildMemberRemove,
];

const eventWhitelist = [
  GatewayEvent.Ready,
  GatewayEvent.Resumed,
  GatewayEvent.GuildCreate,
  GatewayEvent.GuildDelete,
];

const DEFAULTS: DataOptions = {
  track: [],
  disabledEvents: [],
  caching: {},
};

/**
 * Handles all gateway events for the client.
 * @private
 */
export class DataManager {
  /**
   * The client instance.
   * @type {Client}
   */
  public readonly client: Client;

  /**
   * The provided engines.
   * @type {CachingManager}
   */
  public readonly cache: CachingManager;

  /**
   * The janitor instance.
   * @this {Janitor}
   */
  public readonly janitor: Janitor;

  /**
   * The event stats.
   * @type {Collection<GatewayEvent, number>}
   */
  public stats!: Collection<GatewayEvent, number>;

  /**
   * The events to track, if any.
   * @type {Array<GatewayEvent> | "all"}
   */
  public track: GatewayEvent[] | "all";

  /**
   * All events that won't be handled.
   * @type {Set<GatewayEvent>}
   */
  public disabledEvents: Set<GatewayEvent>;

  /**
   * The options provided to the data manager.
   * @type {DataOptions}
   */
  public options: Required<DataOptions>;

  /**
   * The packet queue.
   * @type {Array<Payload<Dictionary[]>>}
   * @private
   */
  readonly #queue: Payload<Dictionary>[];

  /**
   * All of the loaded handlers.
   * @type {Collection<GatewayEvent, Handler>}
   */
  readonly #all: Collection<GatewayEvent, Handler>;

  /**
   * Creates a new Handlers instance.
   * @param {Client} client The client instance.
   * @param {DataOptions} [options={}]
   */
  public constructor(client: Client, options: DataOptions = {}) {
    this.options = options = mergeObjects(options, DEFAULTS);

    this.client = client;
    this.disabledEvents = new Set(options.disabledEvents ?? []);
    this.track = [];
    this.#all = new Collection();
    this.#queue = [];

    this.janitor = new Janitor(this.client, options.janitor);
    this.cache = new CachingManager(this.janitor, options.caching ?? {})
      .on("debug", client.emit.bind(client, "debug"))
      .on("error", client.emit.bind(client, "error"));

    if (options.track) {
      this.stats = new Collection();
      if (Array.isArray(options.track)) this.track = options.track;
      else this.track = "all";
    }
  }

  /**
   * Initializes the packet handling system.
   */
  public async init(): Promise<void> {
    this.janitor.start();
    await this._load();

    this.client.ws.on(
      SMEvent.RawPacket,
      (pk: Payload<Dictionary>, shard: Shard) => this._handle(pk, shard)
    );
  }

  /**
   * Loads all event handlers.
   * @private
   */
  private async _load(): Promise<void> {
    for (const file of walk(join(__dirname, "handlers"))) {
      const imported = await import(file);
      const Handler: Class<Handler> =
        "default" in imported ? imported.default : imported;
      if (!isClass(Handler)) {
        this.client.emit(
          "warn",
          `Built-in packet handler for ${basename(
            file
          )} doesn't return a class, this should be reported.`
        );
        continue;
      }

      const handler: Handler = new Handler(this.client);
      this.#all.set(handler.name, handler);
    }
  }

  /**
   * Handles a gateway event.
   * @param {Payload<Dictionary>} pk
   * @param {Shard} shard
   * @private
   */
  private async _handle(pk: Payload<Dictionary>, shard: Shard) {
    if (pk.op !== GatewayOpCode.Dispatch) return;

    // (0) Check if tracking is enabled for this event.
    const event = pk.t as GatewayEvent;
    if (this.track === "all" || this.track.includes(event)) {
      const prev = this.stats.get(event);
      this.stats.set(event, (prev ?? 0) + 1);
    }

    // (1) Check whether the sharding manager is ready.
    if (!this.client.ws.ready) {
      if (!packetWhitelist.includes(event)) {
        this.#queue.push(pk);
        return;
      }
    }

    // (2) Check if the event is disabled.
    if (!eventWhitelist.includes(event) && this.disabledEvents.has(event)) {
      return;
    }

    // (3) Check whether or not there's any packets in the queue.
    if (this.#queue.length) {
      const queued = this.#queue.shift();
      setImmediate(() => this._handle(queued as Payload<Dictionary>, shard));
    }

    // (4) Handle the packet.
    const handler = this.#all.get(event) as Handler;
    if (!handler) {
      this.client.emit(
        "debug",
        `(Packet Handling) ‹${event}› Handler missing.`
      );
      return;
    }

    try {
      await handler.handle(pk, shard);
      // this.client.emit(
      //   "debug",
      //   `(Packet Handling) ‹${event}› Ran successfully.`
      // );
    } catch (e) {
      this.client.emit(
        "error",
        e,
        `(Packet Handling) ‹${event}› An error occurred, this should be reported to the developers.`
      );
    }
  }
}

export interface DataOptions {
  /**
   * Options for the default engine.
   * @types {CachingOptions}
   */
  caching?: CachingOptions;

  /**
   * The jobs for the janitor.
   * @type {JanitorJobs}
   */
  janitor?: JanitorJobs;

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
}
