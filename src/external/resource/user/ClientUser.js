/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { User } from "./User";
import { exclude, ImageResolver } from "../../../utils";

export class ClientUser extends User {
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

  /**
   * The client presence.
   * @return {ClientPresence}
   */
  get presence() {
    return this.client.presence;
  }

  /**
   * Set the client presence.
   * @param {PresenceData} data The presence data.
   * @param {number | number[]} [shards] The shards to update.
   * @returns {ClientPresence}
   */
  setPresence(data, shards) {
    return this.client.presence.update(data, shards);
  }

  /**
   * Sets the activity the client user is playing.
   * @param {string | UpdateActivity} [name] Current activity, or options for the activity.
   * @param {UpdateActivity} [options] Options for the activity.
   * @return {ClientPresence}
   */
  setActivity(name, options = {}) {
    if (!name) {
      return this.setPresence({ activities: [] }, options.shards);
    }

    const activity = Object.assign({}, options, typeof name === "string" ? { name } : name);
    return this.setPresence({ activities: [ activity ] }, activity.shards);
  }
}

/**
 * @typedef {Object} ClientUserUpdate
 * @property {string} [username]
 * @property {ImageResolvable} [avatar]
 */

/**
 * @typedef {ActivityData} UpdateActivity
 * @prop {number | number[]} [shards] The shards to update.
 */

