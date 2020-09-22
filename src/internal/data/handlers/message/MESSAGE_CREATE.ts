import { Handler } from "../../Handler";
import { neo } from "../../../../structures";

import type { GatewayMessageCreateDispatch } from "discord-api-types";

export default class MESSAGE_CREATE extends Handler<
  GatewayMessageCreateDispatch
> {
  public handle(data: GatewayMessageCreateDispatch): number {
    const message = new (neo.get("Message"))(this.client, data.d);
    message.channel.messages.set(message.id, message);
    message.channel.lastMessageId = message.id;

    console.log(this.clientEvent);
    return this.client.emit(this.clientEvent, message);
  }
}
