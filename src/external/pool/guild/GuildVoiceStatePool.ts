/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ResourcePool } from "../abstract/ResourcePool";
import { ResourceType } from "../abstract/ResourceType";
import { resources } from "../resource/Resources";

import type { VoiceState } from "../resource/guild/member/VoiceState";
import type { Client } from "../../client";

export class GuildVoiceStatePool extends ResourcePool<VoiceState> {
  /**
   * @param {Client} client The client instance.
   */
  public constructor(client: Client) {
    super(client, {
      resource: ResourceType.VoiceState,
      class: resources.get("VoiceState")
    });
  }
}