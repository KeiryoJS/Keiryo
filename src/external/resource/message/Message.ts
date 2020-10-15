/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../../abstract/Resource";

import type { APIMessage } from "discord-api-types";
import type { Client } from "../../../client";

export class Message extends Resource {
  /**
   * The ID of this message.
   *
   * @type {string}
   */
  public readonly id: string;

  /**
   * @param {Client} client The client instance.
   * @param {APIMessage} data The message data.
   */
  public constructor(client: Client, data: APIMessage) {
    super(client);

    this.id = data.id;
  }
}