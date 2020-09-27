import { Handler } from "../../../Handler";

import type { GatewayGuildMemberUpdateDispatch } from "discord-api-types";

export default class GUILD_MEMBER_UPDATE extends Handler<
  GatewayGuildMemberUpdateDispatch
> {
  public handle(pk: GatewayGuildMemberUpdateDispatch): number | void {
    const guild = this.client.guilds.get(pk.d.guild_id);
    if (!guild || !pk.d) return;

    const member = guild.members.get(pk.d.user?.id as string);
    if (member) {
      const old = member._clone();
      // @ts-expect-error
      member["_patch"](pk.d);
      return this.client.emit(this.clientEvent, old, member);
    }
  }
}
