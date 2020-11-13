/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Event } from "../Event";
import { resources } from "../../../../external/resource/Resources";

import { Message } from "../../../../external/resource/message/Message";

export default class MESSAGE_CREATE extends Event {
  async handle(data) {
    const message = new (resources.get("Message"))(this.client, data.d);

    /**
     * When a new message is sent in the guild.
     * @prop {Message} message The message object
     */
    this.client.emit("messageCreate", message);
  }
}
