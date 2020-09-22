import { Handler } from "../../Handler";

import type {
  APIMessage,
  GatewayMessageUpdateDispatch,
} from "discord-api-types";
import type { GuildTextChannel } from "../../../../structures/channel/guild/GuildTextChannel";

export default class MESSAGE_UPDATE extends Handler<
  GatewayMessageUpdateDispatch
> {
  public handle(data: GatewayMessageUpdateDispatch): unknown {
    const guild = data.d.guild_id
      ? this.client.guilds.get(data.d.guild_id)
      : null;

    const channel = guild
      ? guild.channels.get<GuildTextChannel>(data.d.channel_id)
      : this.client.dms.get(data.d.channel_id);

    if (!channel) return;

    const message = channel.messages.get(data.d.id);
    if (message) {
      const old = message.clone();
      message["_patch"](data.d as APIMessage);
      channel.messages.set(message.id, message);
      return this.client.emit(this.clientEvent, old, message);
    }
  }
}
