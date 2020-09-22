import { Handler } from "../../../Handler";
import { neo } from "../../../../../structures";

import type { GatewayGuildMemberAddDispatch } from "discord-api-types";

export default class GUILD_MEMBER_ADD extends Handler<
  GatewayGuildMemberAddDispatch
> {
  public handle(pk: GatewayGuildMemberAddDispatch): number | void {
    const guild = this.client.guilds.get(pk.d.guild_id);
    if (!guild) return;

    const member = new (neo.get("Member"))(guild, pk.d);
    member.guild.members["_set"](member);
    if (member.guild.memberCount !== null) ++member.guild.memberCount;

    this.client.emit(this.clientEvent, member, guild);
  }
}
