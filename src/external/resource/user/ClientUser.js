/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { User } from "./User";
import { exclude, ImageResolver } from "../../../utils";

export class ClientUser extends User {
  /**
   * Set the username of the current user.
   * @param {string} username The new username.
   * @returns {Promise<ClientUser>}
   */
  setUsername(username) {
    return this.update({ username });
  }

  /**
   * Update the current users avatar.
   * @param {ImageResolvable} [avatar] The avatar to update the current one with.
   * @returns {Promise<ClientUser>}
   */
  setAvatar(avatar) {
    return this.update({ avatar });
  }

  /**
   * Updates the current user..
   * @param {ClientUserUpdate} data The fields to update.
   * @return {Promise<ClientUser>}
   */
  async update(data) {
    const resp = await this.client.rest.patch(`/users/@me`, {
      data: {
        ...exclude(data, "avatar"),
        avatar: data.avatar
          ? await ImageResolver.resolveImage(data.avatar)
          : data.avatar
      }
    });

    return this._patch(resp);
  }
}

/**
 * @typedef {Object} ClientUserUpdate
 * @property {string} [username]
 * @property {ImageResolvable} [avatar]
 */
