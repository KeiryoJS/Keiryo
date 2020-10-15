/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../../abstract/Resource";

import type { Client } from "../../../client";
import type { APIGuildIntegration } from "discord-api-types";

export class Integration extends Resource {
  /**
   * The ID of this Integration.
   *
   * @type {string}
   */
  public readonly id: string;

  /**
   * @param {Client} client The client instance.
   * @param {APIGuildIntegration} data The Integration data.
   */
  public constructor(client: Client, data: APIGuildIntegration) {
    super(client);

    this.id = data.id;
  }
}