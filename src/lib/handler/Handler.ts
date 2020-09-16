/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { capitalize } from "@neocord/utils";

import type { GatewayEvent } from "@neocord/gateway";
import type { Client } from "../Client";
import type { GatewayDispatchPayload } from "discord-api-types/default";

export abstract class Handler<T extends GatewayDispatchPayload = any> {
  /**
   * The client instance.
   */
  public readonly client: Client;

  /**
   * Creates a new instance of Handler.
   * @param client
   */
  public constructor(client: Client) {
    this.client = client;
  }

  /**
   * The name of this handler. Also used as the value for filtering packets.
   */
  public get name(): GatewayEvent {
    return this.constructor.name as GatewayEvent;
  }

  /**
   * The event to use for client events.
   */
  public get clientEvent(): string {
    const [ f, ...rest ] = this.name.split("_");
    return f.toLowerCase() + rest.map(r => capitalize(r)).join("");
  }

  /**
   * Handles a packet that matches the name of the handler.
   * @param payload The full payload that was received.
   */
  public abstract handle(payload: T): void;
}