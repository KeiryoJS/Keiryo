/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../../../abstract/Resource";

import type { GatewayPresenceUpdate } from "discord-api-types";
import type { Client } from "../../../../client";

export class Presence extends Resource {
  /**
   * The ID of the guild member this presence belongs to.
   *
   * @type {string}
   */
  public readonly id: string;

  /**
   * @param {Client} client The client instance.
   * @param {GatewayPresenceUpdate} data The gateway presence update.
   */
  public constructor(client: Client, data: GatewayPresenceUpdate) {
    super(client);

    this.id = data.user.id;
  }
}

