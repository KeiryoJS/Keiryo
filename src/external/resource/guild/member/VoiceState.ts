/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../../../abstract/Resource";

import type { GatewayVoiceState } from "discord-api-types";
import type { Client } from "../../../../client";

export class VoiceState extends Resource {
  /**
   * ID of the member this voice state is for.
   *
   * @type {string}
   */
  public readonly id: string;

  /**
   * @param {Client} client The client instance.
   * @param {GatewayVoiceState} data The voice state data.
   */
  public constructor(client: Client, data: GatewayVoiceState) {
    super(client);

    this.id = data.user_id;
  }
}