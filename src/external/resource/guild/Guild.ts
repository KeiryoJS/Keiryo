/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../../abstract/Resource";
import { GuildRolePool } from "../../pool/guild/GuildRolePool";

import type { APIGuild } from "discord-api-types";
import type { Client } from "../../../client";
import { GuildPresencePool } from "../../pool/guild/GuildPresencePool";

export class Guild extends Resource {
  /**
   * The ID of this guild.
   *
   * @type {string}
   */
  public readonly id: string;

  /**
   * The roles in this guild
   *
   * @type {GuildRolePool}
   */
  public readonly roles: GuildRolePool;

  /**
   * The presences in this guild.
   *
   * @type {GuildPresencePool}
   */
  public readonly presences: GuildPresencePool;

  /**
   * @param {Client} client The client instance.
   * @param {APIGuild} data The guild data.
   */
  public constructor(client: Client, data: APIGuild) {
    super(client);

    this.id = data.id;

    this.roles = new GuildRolePool(this);
    this.presences = new GuildPresencePool(this);
  }
}