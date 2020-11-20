/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Event } from "./Event";
import { resources } from "../../../external/resource/Resources";

export default class READY extends Event {
  async handle(data) {
    if (this.client.user) {
      this.client.user._patch(data.d.user);
    } else {
      this.client.user = new (resources.get("ClientUser"))(this.client, data.d.user);
    }

    this.client.users.set(this.client.user.id, this.client.user);

    if (data.d.guilds) {
      for (const guild of data.d.guilds) {
        this.client.guilds.add(guild);
      }
    }
  }
}