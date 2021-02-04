/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../Resource";

export class Integration extends Resource {
  /**
   * @param {Client} client The client instance.
   * @param {Object} data The integration data.
   * @param {Guild} guild The Guild that this integration belongs to.
   */
  constructor(client, data, guild) {
    super(client);

    /**
     * The ID of this integration.
     *
     * @type {string}
     */
    this.id = data.id;

    /**
     * The name of this integration.
     *
     * @type {string}
     */
    this.name = data.name;

    /**
     * The type of this integration.
     *
     * @type {IntegrationType}
     */
    this.type = data.type;

    /**
     * Whether this integration is enabled.
     *
     * @type {boolean}
     */
    this.enabled = data.enabled;

    /**
     * The integration account information.
     */
    this.account = data.account;

    if ("syncing" in data) {
      /**
       * Whether this integration is syncing.
       *
       * @type {?boolean}
       */
      this.syncing = data.syncing;
    }

    if ("role_id" in data) {
      /**
       * ID that this integration uses for "subscribers".
       *
       * @type {?string}
       */
      this.roleId = data.role_id;
    }

    if ("user" in data) {
      client.users.add(data.user);

      /**
       * The user for this integration.
       *
       * @type {?string}
       */
      this.userId = data.user.id;
    }
  }

  /**
   * Returns the guild of this integration.
   *
   * @param options
   *
   * @returns {Promise<Guild>}
   */
  getGuild(options) {
    return this.client.guilds.get(options);
  }

  /**
   * Returns the role of this integration, or null if this is a discord bot integration.
   *
   * @param options
   *
   * @returns {Promise<Role | null>}
   */
  async getRole(options) {
    if (!this.roleId) {
      return null;
    }

    return this.client.roles.get(options);
  }

  /**
   * Returns the user of this integration, or null if this is a discord bot integration.
   *
   * @param options
   *
   * @returns {Promise<User | null>}
   */
  async getUser(options) {
    if (!this.userId) {
      return null;
    }

    return this.client.users.get(options);
  }

  /**
   * Syncs this integration.
   *
   * @returns {Promise<Integration>}
   */
  async sync() {
    this.syncing = true;

    await this.client.rest.queue(`/guilds/${this.guildId}/integrations/${this.id}/sync`, {
      method: "post"
    });

    this.syncing = false;
    this.syncedAtTimestamp = Date.now();

    return this;
  }

  /**
   * Modify the behavior and settings of this integration.
   *
   * @param {ModifyIntegrationData} data The settings to modify.
   * @param {string} [reason] The reason for modifying this integration.
   *
   * @returns {Promise<Integration>}
   */
  async modify(data, reason) {
    const resp = await this.client.rest.queue(`/guilds/${this.guildId}/integrations/${this.id}`, {
      method: "post",
      reason,
      body: {
        expire_behavior: data.expireBehavior,
        expire_grace_period: data.expireGracePeriod,
        enable_emoticons: data.enable_emoticons
      }
    });

    return this._patch(resp);
  }

  /**
   * Updates this integration with data from Discord.
   *
   * @param {Object} data The integration data.
   *
   * @private
   */
  _patch(data) {
    if ("enable_emoticons" in data) {
      /**
       * Whether emoticons should be synced for this integration (twitch only).
       *
       * @type {boolean}
       */
      this.enableEmoticons = data.enable_emoticons;
    }

    if ("synced_at" in data) {
      /**
       * Timestamp of when this integration as last synced.
       *
       * @type {number}
       */
      this.syncedAtTimestamp = Date.parse(data.synced_at);
    }

    if ("expire_behavior" in data) {
      /**
       * The behavior of expiring subscribers.
       *
       * @type {IntegrationExpireBehavior}
       */
      this.expireBehavior = data.expire_behavior;
    }

    if ("expire_grace_period" in data) {
      /**
       * The grace period (in days) before expiring subscribers.
       *
       * @type {number}
       */
      this.expireGracePeriod = data.expire_grace_period;
    }

    return this;
  }
}

/**
 * @typedef {"twitch" | "youtube" | "discord"} IntegrationType
 */

/**
 * @typedef {Object} ModifyIntegrationData
 * @property {IntegrationExpireBehavior} expireBehavior The behavior when an integration subscription lapses.
 * @property {boolean} enableEmoticons Whether emoticons should be synced for this integration (twitch only).
 * @property {number} expireGracePeriod Period (in days) where the integration will ignore lapsed subscriptions.
 */
