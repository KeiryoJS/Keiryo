/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { GatewayEvent, GatewayOpCode, Payload } from "@neocord/gateway";
import { Class, Collection, isClass, walk } from "@neocord/utils";
import { join } from "path";

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

export class Handlers {
  /**
   * The client instance.
   */
  public readonly client: Client;

  /**
   * The event stats.
   */
  public stats!: Collection<GatewayEvent, number>;

  /**
   * The events to track, if any.
   */
  public track: GatewayEvent[] | "all";

  /**
   * The packet queue.
   * @private
   */
  private _queue: Payload<Dictionary>[];

  /**
   * All of the loaded handlers.
   */
  private readonly _all: Collection<GatewayEvent, Handler>;

  /**
   * Creates a new Handlers instance.
   * @param client The client instance.
   * @param track Whether or not to track how many of each event are received.
   */
  public constructor(client: Client, track: boolean | GatewayEvent[] = false) {
    this.client = client;
    this.track = [];

    this._all = new Collection();
    this._queue = [];

    if (track) {
      this.stats = new Collection();
      if (Array.isArray(track)) this.track = track;
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
    for (const file of walk(join(__dirname, "all"))) {
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

  private async _handle(pk: Payload<Dictionary>) {
    if (pk.op !== GatewayOpCode.Dispatch) return;

    // (0) Check if tracking is enabled for this event.
    const event = pk.t as GatewayEvent;
    if (this.track === "all" || this.track.includes(event)) {
      const prev = this.stats.get(event);
      this.stats.set(event, (prev ?? 0) + 1);
    }

    // (1) Check whether or not the ISM is ready.
    if (!this.client.ws.ready) {
      if (!packetWhitelist.includes(event)) {
        this._queue.push(pk);
        return;
      }
    }

    // (2) Check whether or not there's any packets in the queue.
    if (this._queue.length) {
      const queued = this._queue.shift();
      setImmediate(() => this._handle(queued as Payload<Dictionary>));
    }

    // (3) Handle the packet.
    const handler = this._all.get(event) as Handler;

    try {
      await handler.handle(pk);
      this.client.emit(
        "debug",
        `(Packet Handling) ‹${event}› Ran successfully.`
      );
    } catch (e) {
      this.client.emit(
        "error",
        `(Packet Handling) ‹${event}› An error occurred, this should be reported to the developers\n${e}`
      );
    }
  }

  /**
   * Listens for events.
   * @private
   */
  private _listen(): void {
    this.client.ws.on("raw", async (pk: Payload<Dictionary>) =>
      this._handle(pk)
    );
  }
}
