/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Event } from "./Event";

export default class PRESENCE_UPDATE extends Event {
  handle(data) {
    let user = this.client.users.get(data.d.user.id);
    if (!user) {
      if (!data.d.user.username && !this.client.caching.cbp("user")) {
        return;
      }

      user = this.client.users.add(data.d.user);
    }

    const guild = data.d.guild_id && this.client.guilds.get(data.d.guild_id);
    if (!guild) {
      return;
    }

    const old = guild.presences.get(user.id)._clone();
    if (data.d.status && data.d.status !== "offline") {
      guild.members.add({
        user,
        deaf: false,
        mute: false,
        roles: []
      });
    }

    const presence = guild.presences.add(data.d);
    return this.emit(presence, old);
  }
}