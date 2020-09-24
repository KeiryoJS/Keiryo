/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { BaseManager } from "./BaseManager";
import { neo } from "../structures";
import { DiscordStructure } from "../util";

import type { VoiceState } from "../structures/guild/VoiceState";
import type { Guild } from "../structures/guild/Guild";

export class VoiceStateManager extends BaseManager<VoiceState> {
  /**
   * The guild instance.
   * @type {Guild}
   */
  public readonly guild: Guild;

  /**
   * Creates a new instanceof VoiceStateManager.
   * @param {Guild} guild The guild instance.
   */
  public constructor(guild: Guild) {
    super(guild.client, {
      structure: DiscordStructure.VoiceState,
      class: neo.get("VoiceState"),
    });

    this.guild = guild;
  }
}
