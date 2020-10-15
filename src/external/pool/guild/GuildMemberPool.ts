/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ResourcePool } from "../abstract/ResourcePool";
import { resources } from "../resource/Resources";
import { ResourceType } from "../abstract/ResourceType";

import type { GuildMember } from "../resource/guild/member/GuildMember";
import type { Client } from "../../client";

export class GuildMemberPool extends ResourcePool<GuildMember> {
  /**
   * @param {Client} client The client instance.
   */
  public constructor(client: Client) {
    super(client, {
      class: resources.get("GuildMember"),
      resource: ResourceType.GuildMember
    });
  }
}