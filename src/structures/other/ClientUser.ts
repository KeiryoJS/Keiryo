/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { User } from "./User";
import { ImageResolvable, ImageResolver } from "../../util";

import type { RESTPatchAPICurrentUserResult } from "discord-api-types/default";

export class ClientUser extends User {
  /**
   * Set the username of the current user.
   * @param username The new username.
   */
  public setUsername(username: string): Promise<this> {
    return this.update({ username });
  }

  /**
   * Update the current users avatar.
   * @param avatar The avatar to update the current one with.
   */
  public setAvatar(avatar: ImageResolvable | null): Promise<this> {
    return this.update({ avatar });
  }

  /**
   * Updates the current user.
   * @param data The new username or avatar to update the current user with.
   */
  public async update(data: ClientUserUpdate = {}): Promise<this> {
    const _data = await this.client.api.patch<RESTPatchAPICurrentUserResult>(
      "/users/@me",
      {
        body: {
          ...data,
          avatar: data.avatar
            ? await ImageResolver.resolveImage(data.avatar)
            : data.avatar,
        },
      }
    );

    return this._patch(_data);
  }
}

export interface ClientUserUpdate {
  username?: string;
  avatar?: ImageResolvable | null;
}
