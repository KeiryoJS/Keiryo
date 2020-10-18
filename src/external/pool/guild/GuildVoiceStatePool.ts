/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ResourcePool, ResourceType } from "../../abstract";
import { resources } from "../../resource/Resources";

import type { VoiceState } from "../../resource/guild/member/VoiceState";
import type { Guild } from "../../resource/guild/Guild";

export class GuildVoiceStatePool extends ResourcePool<VoiceState> {
  /**
   * The guild that this voice state pool belongs to.
   *
   * @type {Guild}
   * @private
   */
  readonly #guild: Guild;

  /**
   * @param {Guild} guild The guild instance.
   */
  public constructor(guild: Guild) {
    super(guild.client, {
      class: resources.get("VoiceState"),
      resource: ResourceType.VoiceState
    });

    this.#guild = guild;
  }

  /**
   * The guild that this voice state pool belongs to.
   *
   * @type {Guild}
   */
  public get guild(): Guild {
    return this.#guild;
  }
}