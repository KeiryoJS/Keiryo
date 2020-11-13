/*
 * Copyright (c) 2020. MeLike2D & aesthetical All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../../../abstract/Resource";

export class GuildMember extends Resource {
  /**
   * Creates a new instance of a Discord Member.
   * @param {Client} client
   * @param {Object} data
   */
  constructor(client, data) {
    super(client);

    this._patch(data);
  }

  /**
   * Update this member
   * @param {Object} data
   */
  _patch(data) {
    if (Reflect.has(data, "user")) {
      this.client.users.add(data.user)
    }

    /**
     * If the member is pending
     * @type {boolean}
     */
    this.pending = data.is_pending ?? false;

    /**
     * When the member joined the guild
     * @type {number}
     */
    this.joinedAt = data.joined_at ? new Date(data.joined_at).getTime() : null;

    /**
     * The role the member appears in on the members list
     * @type {string | null}
     */
    this.hoistedRole = data.hoisted_role;

    /**
     * The nickname of the member
     * @type {string}
     */
    this.nickname = data.nick ?? this.user ? this.user.username : null;

    /**
     * The time the user became a booster in the guild
     * @type {number | null}
     */
    this.boostingSince = data.premium_since
      ? new Date(data.premium_since).getTime()
      : null;

    /**
     * If the member is muted
     * @type {boolean}
     */
    this.muted = data.mute ?? false;

    /**
     * If the member is deafened
     * @type {boolean}
     */
    this.deafened = data.deaf ?? false;
  }
}
