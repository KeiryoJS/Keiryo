/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../../../abstract/Resource";

import type { Client } from "../../../../client";
import type { APIBan } from "discord-api-types";

export class Ban extends Resource {
  /**
   * ID of the user that this ban is for.
   *
   * @type {string}
   */
  public readonly id: string;

  /**
   * @param {Client} client The client instance.
   * @param {APIBan} data The ban data.
   */
  public constructor(client: Client, data: APIBan) {
    super(client);


    this.id = client.users["_add"](data.user).id;
  }
}