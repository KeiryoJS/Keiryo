/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Event } from "../Event";
import { ClientEvent } from "../../../../utils";

export default class GUILD_DELETE extends Event {
  async handle(data) {
    const guild = this.client.guilds.get(data.d.id);
    if (guild) {
      if (data.d.unavailable) {
        guild.unavailable = true;
        return this.client.emit(ClientEvent.GUILD_UNAVAILABLE, guild);
      }

      this.client.guilds.delete(data.d.id);
      guild.deleted = true;
      return this.client.emit(this.clientEvent, guild._freeze());
    }
  }
}