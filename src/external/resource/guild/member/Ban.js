/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../../../abstract/Resource";

export class Ban extends Resource {
  /**
   * @param {Client} client The client instance.
   * @param {Object} data The ban data.
   * @param {Guild} guild The guild that this ban belongs to
   */
  constructor(client, data, guild) {
    super(client);

    /**
     * The ID of the user this ban is for.
     * @type {string}
     */
    this.id = client.users.add(data.user).id;

    /**
     * The reason of this ban.
     * @type {?string}
     */
    this.reason = data.reason;

    /**
     * The guild that this ban belongs to.
     * @type {Guild}
     */
    this.guild = guild;

    /**
     * Whether this ban has been deleted.
     * @type {boolean}
     */
    this.deleted = false;
  }

  /**
   * The user that this ban is for.
   * @return {User}
   */
  get user() {
    return this.client.users.get(this.id);
  }

  /**
   * Deletes this ban. (Unbans the user)
   * @param {string} [reason] Reason for deleting this ban.
   * @return {Promise<Ban>}
   */
  async delete(reason) {
    await this.guild.bans.remove(this, reason);
    this.deleted = true;
    return this._freeze();
  }
}