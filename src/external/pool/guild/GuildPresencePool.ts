/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */


import { ResourcePool, ResourceType } from "../../abstract";
import { resources } from "../../resource/Resources";

import type { GatewayPresenceUpdate } from "discord-api-types";
import type { Presence } from "../../resource/guild/member/Presence";
import type { Guild } from "../../resource/guild/Guild";

export class GuildPresencePool extends ResourcePool<Presence> {
  /**
   * The guild this pool belongs to.
   *
   * @type {Guild}
   * @private
   */
  readonly #guild: Guild;

  /**
   * @param {Guild} guild The guild this pool belongs to.
   */
  public constructor(guild: Guild) {
    super(guild.client, {
      class: resources.get("Presence"),
      resource: ResourceType.Presence
    });

    this.#guild = guild;
  }

  /**
   * Creates a new presence.
   * @param {GatewayPresenceUpdate} data The presence data.
   *
   * @protected
   */
  protected _create(data: GatewayPresenceUpdate): Presence {
    return new this.class(this.client, data, this.#guild);
  }
}
