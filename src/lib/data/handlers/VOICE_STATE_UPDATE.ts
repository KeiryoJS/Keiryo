/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Handler } from "../Handler";
import type { GatewayVoiceStateUpdateDispatch } from "discord-api-types";

export default class VOICE_STATE_UPDATE extends Handler<
  GatewayVoiceStateUpdateDispatch
> {
  public handle(pk: GatewayVoiceStateUpdateDispatch): number | void {
    const guild = this.client.guilds.get(pk.d.guild_id as string);
    if (!guild) return;

    let state = guild.voiceStates.get(pk.d.user_id);
    if (state) {
      state["_patch"](pk.d);
      return this.client.emit(this.clientEvent, state);
    }

    state = guild.voiceStates["_add"](pk.d);
    return this.client.emit(this.clientEvent, state);
  }
}
