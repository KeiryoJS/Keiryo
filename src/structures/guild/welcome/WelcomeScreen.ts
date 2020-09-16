/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { neo } from "../../Extender";

import type { APIGuildWelcomeScreen } from "discord-api-types/default";
import type { WelcomeChannel } from "./WelcomeChannel";
import type { Guild } from "../Guild";

export class WelcomeScreen {
  /**
   * The guild this welcome screen belongs to.
   */
  public readonly guild: Guild;

  /**
   * The description of the server.
   */
  public description!: string | null;

  /**
   * Configured welcome screen channels.
   */
  public welcomeChannels!: WelcomeChannel[];

  /**
   * Creates a new instanceof WelcomeScreen.
   * @param guild The guild that this welcome screen belongs to.
   * @param data
   */
  public constructor(guild: Guild, data: APIGuildWelcomeScreen) {
    this.guild = guild;
    this._patch(data);
  }

  /**
   * Updates this instance with data from the api.
   * @protected
   */
  protected _patch(data: APIGuildWelcomeScreen): this {
    this.description = data.description;
    this.welcomeChannels = [];

    for (const channel of data.welcome_channels) {
      const welcomeChannel = new (neo.get("WelcomeChannel"))(this, channel);
      this.welcomeChannels.push(welcomeChannel);
    }

    return this;
  }
}
