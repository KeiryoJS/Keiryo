/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Event } from "./Event";

export default class USER_UPDATE extends Event {
  handle(data) {
    let user = this.client.users.get(data.d.id);
    if (user) {
      const old = user._clone();
      user._patch(data);
      return this.emit(user, old);
    }

    user = this.client.users.add(data.d);
    return this.emit(user, user._clone());
  }
}