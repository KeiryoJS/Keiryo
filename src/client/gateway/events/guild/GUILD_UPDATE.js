/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Event } from "../Event";
import { resources } from "../../../../external/resource/Resources";
import { Guild } from "../../../../external/resource/guild/Guild";

export default class GUILD_UPDATE extends Event {
  async handle(data) {
    const guild = this.client.guilds.get(data.d.id);
    if (guild) {
      const old = guild._clone();
      guild["_patch"](data.d);
      return this.emit(guild, old._freeze());
    }

    this.client.guilds.add(data.d);
  }
}