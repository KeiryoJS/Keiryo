/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Event } from "../Event";

export default class GUILD_CREATE extends Event {
  async handle(data) {
    let guild = this.client.guilds.get(data.d.id);
    if (!guild) {
      guild = this.client.guilds.add(data.d);
      return this.client.emit(this.clientEvent, guild);
    }

    const unavailable = guild.unavailable;

    guild["_patch"](data.d);
    if (unavailable && !guild.unavailable) {
      this.client.emit(this.clientEvent, guild);
    }
  }
}