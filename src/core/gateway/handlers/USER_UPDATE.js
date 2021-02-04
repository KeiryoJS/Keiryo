/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { event, Handler } from "../Handler";

@event("USER_UPDATE")
export class UserUpdateHandler extends Handler {
  handle({ d }) {
    const user = this.client.users.get(d.id);
    if (!user) {
      this.client.users.add(d);
      return;
    }

    const old = user._clone();
    user._patch(d);

    return this.emit(user, old);
  }
}