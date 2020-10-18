/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../../abstract/Resource";

import type { APIGuildIntegration, APIIntegrationAccount, APIUser, IntegrationExpireBehavior } from "discord-api-types";
import type { Client } from "../../../client";
import type { Guild } from "./Guild";
import type { User } from "../user/User";

export class Integration extends Resource {
  /**
   * The ID of this Integration.
   *
   * @type {string}
   */
  public readonly id: string;

  /**
   * Integration name.
   *
   * @type {string}
   */
  public readonly name: string;

  /**
   * Integration type (twitch, youtube, etc)
   *
   * @type {string}
   */
  public readonly type: string;

  /**
   * Whether this integration is enabled.
   *
   * @type {boolean}
   */
  public readonly enabled: boolean;

  /**
   * Role ID that that this integration uses for "subscribers".
   *
   * @type {string}
   */
  public readonly roleId: string;

  /**
   * The user for this integration.
   *
   * @type {string}
   */
  public readonly userId: string;

  /**
   * integration account information
   *
   * @type {APIIntegrationAccount}
   */
  public readonly account: APIIntegrationAccount;

  /**
   * Whether this integration is currently syncing.
   * @type {boolean}
   */
  public syncing: boolean;

  /**
   * When this integration was last synced.
   * @type {number}
   */
  public syncedTimestamp!: number;

  /**
   * Whether emoticons should be synced for this integration (twitch only currently).
   *
   * @type {boolean}
   */
  public enableEmoticons!: boolean;

  /**
   * The behavior of expiring subscribers.
   *
   * @type {IntegrationExpireBehavior}
   */
  public expireBehavior!: IntegrationExpireBehavior;

  /**
   * The grace period (in days) before expiring subscribers.
   *
   * @type {number}
   */
  public expireGracePeriod!: number;

  /**
   * Whether this integration is deleted.
   *
   * @type {boolean}
   */
  public deleted = false;

  /**
   * The guild that this integration belongs to.
   *
   * @type {Guild}
   * @private
   */
  readonly #guild: Guild;

  /**
   * @param {Client} client The client instance.
   * @param {APIGuildIntegration} data The Integration data.
   * @param {Guild} guild The guild instance.
   */
  public constructor(client: Client, data: APIGuildIntegration, guild: Guild) {
    super(client);

    this.#guild = guild;

    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.enabled = data.enabled;
    this.syncing = data.syncing as boolean;
    this.account = data.account;
    this.roleId = data.role_id as string;
    this.userId = client.users["_add"](data.user as APIUser).id;
  }

  /**
   * The guild that this integration belongs to.
   *
   * @type {Guild}
   */
  public get guild(): Guild {
    return this.#guild;
  }

  /**
   * The user for this integration.
   *
   * @type {?User}
   */
  public get user(): User | null {
    return this.client.users.cache.get(this.userId) ?? null;
  }

  /**
   * Syncs this integration.
   *
   * @returns {Promise<Integration>}
   */
  public sync(): Promise<Integration> {
    this.syncing = true;

    return this.client.rest
      .post(`/guilds/${this.guild.id}/integrations/${this.id}/sync`)
      .then(() => {
        this.syncing = false;
        this.syncedTimestamp = Date.now();
        return this;
      });
  }

  /**
   * Edit this integration.
   * @param {EditIntegration} data The data to edit this integration with.
   * @param {string} [reason] Reason for editing this integration.
   *
   * @returns {Promise<Integration>}
   */
  public async edit(
    data: EditIntegration,
    reason?: string
  ): Promise<Integration> {
    const ep = `/guilds/${this.guild.id}/integrations/${this.id}`,
      d = await this.client.rest.patch(ep, {
        reason,
        body: {
          expire_behavior: data.expireBehavior,
          expire_grace_period: data.expireGracePeriod,
          enable_emoticons: data.enableEmoticons
        }
      });

    return this._patch(d as APIGuildIntegration);
  }


  /**
   * Updates this integration with data from discord.
   * @param {APIGuildIntegration} data
   *
   * @protected
   */
  protected _patch(data: APIGuildIntegration): this {
    if (data.enable_emoticons) {
      this.enableEmoticons = data.enable_emoticons;
    }

    if (data.synced_at) {
      this.syncedTimestamp = new Date(data.synced_at).getTime();
    }

    if (data.expire_behavior) {
      this.expireBehavior = data.expire_behavior;
    }

    if (data.expire_grace_period) {
      this.expireGracePeriod = data.expire_grace_period;
    }

    return this;
  }
}

export interface EditIntegration {
  /**
   * The behavior when an integration subscription lapses (see the integration expire behaviors documentation).
   * @type {IntegrationExpireBehavior}
   */
  expireBehavior?: IntegrationExpireBehavior;

  /**
   * Period (in days) where the integration will ignore lapsed subscriptions.
   * @type {boolean}
   */
  expireGracePeriod?: number;

  /**
   * Whether emoticons should be synced for this integration (twitch only currently).
   * @type {boolean}
   */
  enableEmoticons?: boolean;
}

