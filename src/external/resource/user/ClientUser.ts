/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { User } from "./User";
import { exclude, ImageResolvable, ImageResolver } from "../../../utils";

import type { RESTPatchAPICurrentUserResult } from "discord-api-types";

export class ClientUser extends User {
  /**
   * Set the username of the current user.
   * @param {string} username The new username.
   *
   * @returns {Promise<ClientUser>}
   */
  public setUsername(username: string): Promise<this> {
    return this.update({ username });
  }

  /**
   * Update the current users avatar.
   * @param {ImageResolvable | null} avatar The avatar to update the current one with.
   *
   * @returns {Promise<ClientUser>}
   */
  public setAvatar(avatar: ImageResolvable | null): Promise<this> {
    return this.update({ avatar });
  }

  /**
   * Updates the current user.
   * @param {ClientUserUpdate} data The new username or avatar to update the current user with.
   *
   * @returns {Promise<ClientUser>}
   */
  public async update(data: ClientUserUpdate = {}): Promise<this> {
    const _data = await this.client.rest.patch<RESTPatchAPICurrentUserResult>(
      "/users/@me",
      {
        body: {
          ...exclude(data, "avatar"),
          avatar: data.avatar
            ? await ImageResolver.resolveImage(data.avatar)
            : data.avatar
        }
      }
    );

    return this._patch(_data);
  }
}

export interface ClientUserUpdate {
  username?: string;
  avatar?: ImageResolvable | null;
}

