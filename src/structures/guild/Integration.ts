/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Base } from "../Base";

import type {
  APIGuildIntegration,
  APIIntegrationAccount,
  APIUser,
  IntegrationExpireBehavior,
} from "discord-api-types";
import type { Client } from "../../internal";
import type { Guild } from "./Guild";
import type { Role } from "./Role";
import type { User } from "../other/User";

export class Integration extends Base {
  /**
   * Integration ID.
   * @type {string}
   */
  public readonly id: string;

  /**
   * Integration name.
   * @type {string}
   */
  public readonly name: string;

  /**
   * Integration type (twitch, youtube, etc)
   * @type {string}
   */
  public readonly type: string;

  /**
   * Whether this integration is enabled.
   * @type {boolean}
   */
  public readonly enabled: boolean;

  /**
   * Role ID that that this integration uses for "subscribers".
   * @type {string}
   */
  public readonly roleId: string;

  /**
   * The user for this integration.
   * @type {string}
   */
  public readonly userId: string;

  /**
   * integration account information
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
   * @type {boolean}
   */
  public enableEmoticons!: boolean;

  /**
   * The behavior of expiring subscribers.
   * @type {IntegrationExpireBehavior}
   */
  public expireBehavior!: IntegrationExpireBehavior;

  /**
   * The grace period (in days) before expiring subscribers.
   * @type {number}
   */
  public expireGracePeriod!: number;

  /**
   * Whether this integration is deleted.
   * @type {boolean}
   */
  public deleted = false;

  /**
   * The guild that this integration belongs to.
   * @type {Guild}
   * @private
   */
  readonly #guild: Guild;

  /**
   * @param {Client} client
   * @param {APIGuildIntegration} data
   * @param {Guild} guild
   */
  public constructor(client: Client, data: APIGuildIntegration, guild: Guild) {
    super(client);

    this.#guild = guild;

    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.enabled = data.enabled;
    this.syncing = data.syncing;
    this.account = data.account;
    this.roleId = data.role_id;
    this.userId = client.users["_add"](data.user as APIUser).id;

    this._patch(data);
  }

  /**
   * The guild that this integration belongs to.
   * @type {Guild}
   */
  public get guild(): Guild {
    return this.#guild;
  }

  /**
   * Role that that this integration uses for "subscribers".
   * @type {?Role}
   */
  public get role(): Role | null {
    return this.guild.roles.get(this.roleId) ?? null;
  }

  /**
   * The user for this integration.
   * @type {?User}
   */
  public get user(): User | null {
    return this.client.users.get(this.userId) ?? null;
  }

  /**
   * Syncs this integration.
   * @returns {Promise<Integration>}
   */
  public sync(): Promise<Integration> {
    this.syncing = true;
    return this.client.api
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
   * @returns {Promise<Integration>}
   */
  public async edit(
    data: EditIntegration,
    reason?: string
  ): Promise<Integration> {
    const ep = `/guilds/${this.guild.id}/integrations/${this.id}`;
    const d = await this.client.api.patch(ep, {
      reason,
      body: {
        expire_behavior: data.expireBehavior,
        expire_grace_period: data.expireGracePeriod,
        enable_emoticons: data.enableEmoticons,
      },
    });

    return this._patch(d as APIGuildIntegration);
  }

  /**
   * Updates this integration with data from discord.
   * @param {APIGuildIntegration} data
   * @protected
   */
  protected _patch(data: APIGuildIntegration): this {
    if (data.enable_emoticons) this.enableEmoticons = data.enable_emoticons;
    this.syncedTimestamp = new Date(data.synced_at).getTime();
    this.expireBehavior = data.expire_behavior;
    this.expireGracePeriod = data.expire_grace_period;

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
