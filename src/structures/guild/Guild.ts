/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Snowflake } from "@neocord/utils";
import { Base } from "../Base";

import type { InternalShard } from "@neocord/gateway";
import type { APIGuild } from "discord-api-types/default";
import type { Client } from "../../lib";

export class Guild extends Base {
  /**
   * The ID of this guild.
   */
  public readonly id: string;

  /**
   * The shard that this guild operates on.
   */
  public readonly shard: InternalShard;

  /**
   * Creates a new instance of Guild.
   * @param client
   * @param data
   */
  public constructor(client: Client, data: APIGuild) {
    super(client);

    this.id = data.id;

    const shardId = this.snowflake.timestamp % client.ws.shards.size;
    this.shard = this.client.ws.shards.get(shardId) as InternalShard;
  }

  /**
   * The snowflake data.
   */
  public get snowflake(): Snowflake {
    return new Snowflake(this.id);
  }
}