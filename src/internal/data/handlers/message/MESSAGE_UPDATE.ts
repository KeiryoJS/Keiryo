import { Handler } from "../../Handler";
import MESSAGE_DELETE from "./MESSAGE_DELETE";

import type {
  APIMessage,
  GatewayMessageUpdateDispatch,
} from "discord-api-types";
import { Channel } from "../../../../structures/channel/Channel";

export default class MESSAGE_UPDATE extends Handler<
  GatewayMessageUpdateDispatch
> {
  public handle(data: GatewayMessageUpdateDispatch): unknown {
    const channel = MESSAGE_DELETE.getChannel(
      this.client,
      data.d.channel_id,
      data.d.guild_id
    );
    if (!channel || !Channel.isTextable(channel)) return;

    const message = channel.messages.get(data.d.id);
    if (message) {
      const old = message._clone();
      message["_patch"](data.d as APIMessage);
      channel.messages["_set"](message);
      return this.client.emit(this.clientEvent, old, message);
    }
  }
}
