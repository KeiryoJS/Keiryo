/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Event } from "../Event";
import { resources } from "../../../../external/resource/Resources";
import { Guild } from "../../../../external/resource/guild/Guild";

export default class GUILD_CREATE extends Event {
  async handle(data) {
    const guild = new(resources.get("Guild"))(this.client, data.d);

    /**
     * When a new guild is created
     * @prop {Guild} guild
     */
    this.client.emit("guildCreate", guild)
  }
}