/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Event } from "./Event";

export default class VOICE_STATE_UPDATE extends Event {
  handle(data) {
    const guild = data.d.guild_id && this.client.guilds.get(data.d.guild_id);
    if (!guild) {
      return;
    }

    let state = guild.voiceStates.get(data.d.user_id);
    if (state) {
      const old = state._clone();
      state._patch(data.d);
      return this.emit(state, old);
    }

    state = guild.voiceStates.add(data.d);
    return this.emit(state, state._clone);
  }
}