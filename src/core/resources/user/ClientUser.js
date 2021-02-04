import resources from "../Resources";
import { exclude, Files } from "../../../common";

export class ClientUser extends resources.get("User") {
  /**
   * The client presence.
   *
   * @returns {ClientPresence}
   */
  get presence() {
    return this.client.presence;
  }

q  /**
   * Modifies the current user.
   *
   * @param {ModifyClientUser} data The fields to modify.
   *
   * @returns {Promise<ClientUser>}
   */
  async modify(data) {
    const resp = await this.client.rest.queue("/users/@me", {
      method: "patch",
      body: {
        ...exclude(data, "avatar"),
        avatar: data.avatar
          ? await Files.resolveImage(data.avatar)
          : data.avatar
      }
    });

    return this._patch(resp);
  }
}

/**
 * @typedef {Object} ModifyClientUser
 * @property {string} [username]
 * @property {ImageResolvable} [avatar]
 */

/**
 * @typedef {ActivityData} UpdateActivity
 * @prop {number | number[]} [shards] The shards to update.
 */
