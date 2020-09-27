import { Handler } from "../../Handler";
import { Channel } from "../../../../structures/channel/Channel";
import MESSAGE_DELETE from "./MESSAGE_DELETE";

import type { GatewayMessageCreateDispatch } from "discord-api-types";

export default class MESSAGE_CREATE extends Handler<
  GatewayMessageCreateDispatch
> {
  public handle(data: GatewayMessageCreateDispatch): unknown {
    const channel = MESSAGE_DELETE.getChannel(
      this.client,
      data.d.channel_id,
      data.d.guild_id
    );
    if (!channel || !Channel.isTextable(channel))
      return console.log("channel doesn't exist");

    const message = channel.messages["_add"](data.d, channel);
    channel.messages["_set"](message);
    channel.lastMessageId = message.id;

    return this.client.emit(this.clientEvent, message);
  }
}
