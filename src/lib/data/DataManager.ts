/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { GatewayEvent, GatewayOpCode, Payload, Shard } from "@neocord/gateway";
import { Class, Collection, isClass, mergeObjects, walk } from "@neocord/utils";
import { join } from "path";
import { DiscordStructure } from "../../util";

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

const DEFAULTS: DataOptions = {
  track: [],
  disabledEvents: [],
  caching: {
    enabled: true,
    limits: Infinity,
  },
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
   * Limits for discord structures.
   * @type {Map<DiscordStructure, number>}
   */
  public limits: Map<DiscordStructure, number>;

  /**
   * Discord structures that can be cached.
   * @type {Set<DiscordStructure>}
   */
  public enabled: Set<DiscordStructure>;

  /**
   * All events that won't be handled.
   * @type {Set<GatewayEvent>}
   */
  public disabledEvents: Set<GatewayEvent>;

  /**
   * The packet queue.
   * @type {Array<Payload<Dictionary[]>>}
   * @private
   */
  private _queue: Payload<Dictionary>[];

  /**
   * All of the loaded handlers.
   * @type {Collection<GatewayEvent, Handler>}
   */
  private readonly _all: Collection<GatewayEvent, Handler>;

  /**
   * Creates a new Handlers instance.
   * @param {Client} client The client instance.
   * @param {DataOptions} [options={}]
   */
  public constructor(client: Client, options: DataOptions = {}) {
    options = mergeObjects(options, DEFAULTS);

    this.client = client;
    this.track = [];
    this.limits = new Map();
    this.disabledEvents = new Set(options.disabledEvents ?? []);
    this.enabled = new Set();

    this._all = new Collection();
    this._queue = [];

    if (typeof options.caching?.limits === "number") {
      for (const structure of Object.values(DiscordStructure)) {
        this.limits.set(structure as DiscordStructure, options.caching.limits);
      }
    } else {
      if (options.caching?.limits instanceof Map)
        this.limits = options.caching.limits;
      else this.limits = new Collection(options.caching?.limits ?? []);
    }

    if (typeof options.caching?.enabled === "boolean") {
      if (options.caching.enabled)
        for (const structure of Object.values(DiscordStructure)) {
          this.enabled.add(structure as DiscordStructure);
        }
    } else this.enabled = new Set(options.caching?.enabled ?? []);

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
    await this._load();
    this._listen();
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
          "(Packet Handling) Built-in packet handler doesn't return a class, this should be reported."
        );
        continue;
      }

      const handler: Handler = new Handler(this.client);
      this._all.set(handler.name, handler);
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

    // (1) Check if the event is disabled.
    if (!packetWhitelist.includes(event) && this.disabledEvents.has(event)) {
      return;
    }

    // (2) Check whether the sharding manager is ready.
    if (!this.client.ws.ready) {
      if (!packetWhitelist.includes(event)) {
        this._queue.push(pk);
        return;
      }
    }

    // (3) Check whether or not there's any packets in the queue.
    if (this._queue.length) {
      const queued = this._queue.shift();
      setImmediate(() => this._handle(queued as Payload<Dictionary>, shard));
    }

    // (4) Handle the packet.
    const handler = this._all.get(event) as Handler;

    try {
      await handler.handle(pk, shard);
      this.client.emit(
        "debug",
        `(Packet Handling) ‹${event}› Ran successfully.`
      );
    } catch (e) {
      this.client.emit(
        "error",
        e,
        `(Packet Handling) ‹${event}› An error occurred, this should be reported to the developers`
      );
    }
  }

  /**
   * Listens for events.
   * @private
   */
  private _listen(): void {
    this.client.ws.on("raw", async (pk: Payload<Dictionary>, shard: Shard) =>
      this._handle(pk, shard)
    );
  }
}

export interface DataOptions {
  /**
   * Options for caching.
   */
  caching?: {
    /**
     * Whether caching is enabled.
     */
    enabled?: boolean | Set<DiscordStructure> | DiscordStructure[];

    /**
     * Limits for cacheables.
     */
    limits?:
      | number
      | Map<DiscordStructure, number>
      | Tuple<DiscordStructure, number>[];
  };

  /**
   * Events that wont be handled.
   */
  disabledEvents?: Set<GatewayEvent> | GatewayEvent[];

  /**
   * Tracks how many times a certain event is received.
   */
  track?: GatewayEvent[] | "all" | boolean;
}
