/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Collection } from "@neocord/utils";
import { neo } from "../../Extender";

import type { APIGuildWelcomeScreen } from "discord-api-types/default";
import type { WelcomeChannel } from "./WelcomeChannel";
import type { Guild } from "../Guild";

export class WelcomeScreen {
  /**
   * The guild this welcome screen belongs to.
   * @type {Guild}
   */
  public readonly guild: Guild;

  /**
   * The description of the server.
   * @type {string | null}
   */
  public description!: string | null;

  /**
   * Configured welcome screen channels.
   * @type {Collection<string, WelcomeChannel>}
   */
  public welcomeChannels!: Collection<string, WelcomeChannel>;

  /**
   * Creates a new instanceof WelcomeScreen.
   * @param {Guild} guild The guild that this welcome screen belongs to.
   * @param {APIGuildWelcomeScreen} data The welcome screen data from the api.
   */
  public constructor(guild: Guild, data: APIGuildWelcomeScreen) {
    this.guild = guild;
    this.welcomeChannels = new Collection();

    this._patch(data);
  }

  /**
   * Updates this instance with data from the api.
   * @param {APIGuildWelcomeScreen} data
   * @protected
   */
  protected _patch(data: APIGuildWelcomeScreen): this {
    this.description = data.description;

    for (const channel of data.welcome_channels) {
      const welcomeChannel = new (neo.get("WelcomeChannel"))(this, channel);
      this.welcomeChannels.set(channel.channel_id, welcomeChannel);
    }

    return this;
  }
}
