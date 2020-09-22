import { Handler } from "../../../Handler";

import type { GatewayGuildMemberRemoveDispatch } from "discord-api-types";

export default class GUILD_MEMBER_REMOVE extends Handler<
  GatewayGuildMemberRemoveDispatch
> {
  public handle(pk: GatewayGuildMemberRemoveDispatch): number | void {
    const guild = this.client.guilds.get(pk.d.guild_id);
    if (!guild) return;
    if (guild.memberCount !== null) --guild.memberCount;

    const member = guild.members.get(pk.d.user.id);
    if (member) {
      member.deleted = true;
      guild.members.delete(member.id);
      guild.voiceStates.delete(member.id);
      return this.client.emit(this.clientEvent, Object.freeze(member), guild);
    }
  }
}
