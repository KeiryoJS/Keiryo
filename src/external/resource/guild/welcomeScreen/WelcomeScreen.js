/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Collection } from "@neocord/utils";
import { resources } from "../../Resources";

export class WelcomeScreen {
  /**
   * @param {Guild} guild The guild instance.
   * @param {Object} data The welcome screen data.
   */
  constructor(guild, data) {
    /**
     * The guild that this welcome screen belongs to.
     * @type {Guild}
     */
    this.guild = guild;

    /**
     * The configured channels that will be shown.
     * @type {Collection<string, WelcomeChannel>}
     */
    this.channels = new Collection();

    this._patch(data);
  }

  /**
   * Updates this welcome screen with data from the discord api.
   * @param {Object} data The data.
   * @private
   */
  _patch(data) {
    /**
     * The description of the server/
     * @type {string | null}
     */
    this.description = data.description ?? null;

    for (const channel of data.welcome_channels) {
      const welcomeChannel = new (resources.get("WelcomeChannel"))(this, channel);
      this.channels.set(channel.channel_id, welcomeChannel);
    }

    return this;
  }
}