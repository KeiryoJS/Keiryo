/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ResourcePool } from "../abstract/ResourcePool";
import { ResourceType } from "../abstract/ResourceType";
import { resources } from "../resource/Resources";

import type { Guild } from "../resource/guild/Guild";
import type { Client } from "../../client";

export class GuildPool extends ResourcePool<Guild> {
  /**
   * @param {Client} client The client instance.
   */
  public constructor(client: Client) {
    super(client, {
      resource: ResourceType.Guild,
      class: resources.get("Guild")
    });
  }
}
