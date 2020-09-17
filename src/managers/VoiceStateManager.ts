/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { BaseManager } from "./BaseManager";
import { neo } from "../structures/Extender";

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
    super(guild.client, neo.get("VoiceState"));

    this.guild = guild;
  }

  /**
   * The amount of voice states that can be cached at one time.
   * @type {number}
   */
  public get limit(): number {
    // todo: get voice state limit from the client.
    return Infinity;
  }
}
