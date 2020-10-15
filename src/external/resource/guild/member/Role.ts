/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../../../abstract/Resource";

import type { APIRole } from "discord-api-types";
import type { Client } from "../../../../client";

export class Role extends Resource {
  /**
   * ID of this Role.
   *
   * @type {string}
   */
  public readonly id: string;

  /**
   * @param {Client} client The client instance.
   * @param {APIRole} data The Role data.
   */
  public constructor(client: Client, data: APIRole) {
    super(client);


    this.id = data.id;
  }
}