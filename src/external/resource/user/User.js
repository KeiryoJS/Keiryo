/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../../abstract/Resource";
import { UserFlags } from "@neocord/utils";

export class User extends Resource {
  /**
   * @param {Client} client The client.
   * @param {Object} data The user object.
   */
  constructor(client, data) {
    super(client);

    /**
     * The ID of this user.
     * @type {string}
     */
    this.id = data.id;
    this._patch(data);
  }

  /**
   * The users tag.
   * @return {string}
   */
  get tag() {
    return `${this.username}#${this.discriminator}`;
  }

  /**
   * Whether this user is partial.
   * @return {boolean}
   */
  get partial() {
    return typeof this.username !== "string";
  }

  /**
   * The mention string for this user.
   * @type {string}
   */
  get mention() {
    return `<@!${this.id}>`;
  }

  /**
   * The default avatar url for this user.
   * @type {string}
   */
  get defaultAvatarUrl() {
    return this.client.rest.cdn.defaultAvatar((~~this.discriminator) % 5);
  }

  /**
   * The URL for this user's avatar.
   * @param {ImageURLOptions} [options] The options for the url.
   * @returns {string | null}
   */
  avatarURL(options = {}) {
    if (!this.avatar) {
      return null;
    }
    return this.client.rest.cdn.userAvatar(this.id, this.avatar, options);
  }

  /**
   * The display avatar url for this user.
   * @param {ImageURLOptions} [options] The options for the avatar.
   * @returns {string}
   */
  displayAvatarURL(options = {}) {
    return this.avatarURL(options) ?? this.defaultAvatarUrl;
  }

  /**
   * The string representation of this user.
   * @returns {string}
   */
  toString() {
    return this.mention;
  }

  /**
   * Fetches this user from the API.
   * @param {boolean} [force=false] Whether to skip the cache check.
   * @returns {Promise<User>}
   */
  async fetch(force = false) {
    return this.client.users.fetch(this.id, { force });
  }


  /**
   * Update this user.
   * @param {Object} data
   */
  _patch(data) {
    if ("username" in data) {
      /**
       * The user's username, not unique across the platform.
       * @type {?string}
       */
      this.username = data.username;
    } else if (typeof data.username !== "string") {
      this.username = null;
    }

    /**
     * The user's 4-digit discord-tag
     * @type {string}
     */
    this.discriminator = data.discriminator;

    /**
     * The user's avatar hash
     * @type {string | null}
     */
    this.avatar = data.avatar ?? null;

    /**
     * Whether the user belongs to an OAuth2 application
     * @type {boolean}
     */
    this.bot = data.bot ?? false;

    if (Reflect.has(data, "email")) {
      /**
       * The user's email
       * @type {string}
       */
      this.email = data.email;
    }

    /**
     * The flags on a user's account.
     * @type {UserFlags}
     */
    this.flags = new UserFlags(data.flags ?? 0);

    /**
     * the type of Nitro subscription this user has.
     * @type {*|number}
     */
    this.premiumType = data.premium_type ?? 0;

    /**
     * The user's chosen language option
     * @type {string}
     */
    this.locale = data.locale ?? "en-US";

    /**
     * Whether the user has two factor enabled on their account
     * @type {boolean}
     */
    this.mfaEnabled = data.mfa_enabled ?? false;

    /**
     * Whether the email on this account has been verified.
     * @type {boolean}
     */
    this.verified = data.verified ?? false;

    /**
     * Whether the user is an Official Discord System user (part of the urgent message system)
     * @type {boolean}
     */
    this.system = data.system ?? false;

    return this;
  }
}
