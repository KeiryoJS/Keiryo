/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Handler } from "../../../Handler";
import type { GatewayGuildMembersChunkDispatch } from "discord-api-types";

export default class GUILD_MEMBERS_CHUNK extends Handler<
  GatewayGuildMembersChunkDispatch
> {
  public handle(pk: GatewayGuildMembersChunkDispatch): number | void {
    const guild = this.client.guilds.get(pk.d.guild_id);
    if (!guild) {
      this.client.emit(
        "debug",
        `(GUILD_MEMBERS_CHUNK) Received unknown guild ${pk.d.guild_id}`
      );
      return;
    }

    const members = pk.d.members.map((m) => guild.members["_add"](m, guild));
    if (pk.d.presences) {
      for (const presence of pk.d.presences) guild.presences["_add"](presence);
    }

    return this.client.emit(this.clientEvent, guild, {
      members,
      chunkCount: pk.d.chunk_count,
      chunkIndex: pk.d.chunk_index,
      nonce: pk.d.nonce,
    });
  }
}
