/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../../abstract/Resource";

export class Integration extends Resource {
  /**
   * @param {Client} client The client instance.
   * @param {Object} data The integration data.
   * @param {Guild} guild The guild that this integration belongs to.
   */
  constructor(client, data, guild) {
    super(client);

    /**
     * The guild that this integration belongs to.
     * @type {Guild}
     * @readonly
     */
    this.guild = guild;

    /**
     * The ID of this Integration.
     * @type {string}
     * @readonly
     */
    this.id = data.id;

    /**
     * Integration name.
     * @type {string}
     * @readonly
     */
    this.name = data.name;

    /**
     * Integration type (twitch, youtube, etc)
     * @type {string}
     * @readonly
     */
    this.type = data.type;

    /**
     * Whether this integration is enabled.
     * @type {boolean}
     * @readonly
     */
    this.enabled = data.enabled;

    /**
     * Whether this integration is currently syncing.
     * @type {boolean}
     */
    this.syncing = data.syncing;

    /**
     * integration account information
     * @type {Object}
     * @readonly
     */
    this.account = data.account;

    /**
     * Role ID that that this integration uses for "subscribers".
     * @type {string}
     * @readonly
     */
    this.roleId = data.role_id;

    /**
     * The user for this integration.
     * @type {string}
     * @readonly
     */
    this.userId = client.users.add(data.user).id;

    /**
     * Whether this integration has been deleted.
     * @type {boolean}
     */
    this.deleted = false;
  }

  /**
   * The user for this integration.
   * @type {?User}
   */
  get user() {
    return this.client.users.get(this.userId) ?? null;
  }

  /**
   * Syncs this integration.
   * @returns {Promise<Integration>}
   */
  async sync() {
    this.syncing = true;

    await this.client.rest.queue({
      endpoint: `/guilds/${this.guild.id}/integrations/${this.id}/sync`,
      method: "post"
    });

    this.syncing = false;
    this.syncedTimestamp = Date.now();

    return this;
  }

  /**
   * Edit this integration.
   * @param {IntegrationUpdateData} data The data to edit this integration with.
   * @param {string} [reason] Reason for editing this integration.
   * @returns {Promise<Integration>}
   */
  async edit(data, reason) {
    const d = await this.client.rest.queue({
      method: "post",
      endpoint: `/guilds/${this.guild.id}/integrations/${this.id}`,
      reason,
      body: {
        expire_behavior: data.expireBehavior,
        expire_grace_period: data.expireGracePeriod,
        enable_emoticons: data.enableEmoticons
      }
    });

    return this._patch(d);
  }

  /**
   * Updates this integration with data from discord.
   * @param {Object} data
   * @protected
   */
  _patch(data) {
    if (Reflect.has(data, "enable_emoticons")) {
      /**
       * Whether emoticons should be synced for this integration (twitch only currently).
       * @type {boolean}
       */
      this.enableEmoticons = data.enable_emoticons;
    }

    if (Reflect.has(data, "synced_at")) {
      /**
       * When this integration was last synced.
       * @type {number}
       */
      this.syncedTimestamp = new Date(data.synced_at).getTime();
    }

    if (Reflect.has(data, "expire_behavior")) {
      /**
       * The behavior of expiring subscribers.
       * @type {IntegrationExpireBehavior}
       */
      this.expireBehavior = data.expire_behavior;
    }

    if (Reflect.has(data, "expire_grace_period")) {
      /**
       * The grace period (in days) before expiring subscribers.
       * @type {number}
       */
      this.expireGracePeriod = data.expire_grace_period;
    }

    return this;
  }
}

/**
 * @typedef {Object} IntegrationUpdateData
 * @prop {IntegrationExpireBehavior} [expireBehavior] The behavior when an integration subscription lapses (see the integration expire behaviors documentation).
 * @prop {number} [expireGracePeriod] Period (in days) where the integration will ignore lapsed subscriptions.
 * @prop {boolean} [enableEmoticons] Whether emoticons should be synced for this integration (twitch only currently).
 */
