/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { BaseManager, BaseResolvable } from "./BaseManager";
import { neo } from "../structures";
import { DiscordStructure } from "../util";

import type { snowflake } from "@neocord/utils";
import type { Guild } from "../structures/guild/Guild";
import type { Integration } from "../structures/guild/Integration";

export class GuildIntegrationManager extends BaseManager<Integration> {
  /**
   * The guild that this manager belongs to.
   * @type {Guild}
   * @private
   */
  readonly #guild: Guild;

  /**
   * @param {Guild} guild The guild that this manager belongs to.
   */
  public constructor(guild: Guild) {
    super(guild.client, {
      structure: DiscordStructure.Integration,
      class: neo.get("Integration"),
    });

    this.#guild = guild;
  }

  /**
   * The guild that this manager belongs to.
   * @type {Guild}
   */
  public get guild(): Guild {
    return this.#guild;
  }

  /**
   * Add a new guild integration.
   * @param {string} id ID of the integration
   * @param {string} type The type of integration
   */
  public async add(id: string, type: string): Promise<Integration> {
    const integration = await this.client.api.post(
      `/guilds/${this.guild.id}/integrations`,
      {
        body: {
          id,
          type,
        },
      }
    );

    return this._add(integration, this.guild);
  }

  /**
   * Removes an integration from the guild.
   * @param {IntegrationResolvable} integration The integration to remove.
   * @param {string} [reason] Reason for deleting the integration.
   * @returns {Promise<this>}
   */
  public async remove(
    integration: IntegrationResolvable,
    reason?: string
  ): Promise<IntegrationResolvable> {
    const id = this.resolveId(integration);
    if (id) {
      await this.client.api.delete(
        `/guilds/${this.guild.id}/integrations/${id}`,
        {
          reason,
        }
      );

      this.cache.delete(id);
    }

    return integration;
  }

  /**
   * Fetches all integrations for this guild.
   * @returns {Promise<GuildIntegrationManager>}
   */
  public async fetch(): Promise<this> {
    const entries = await this.client.api.get<[]>(
      `/guilds/${this.guild.id}/integrations`
    );
    for (const integration of entries) this._add(integration);
    return this;
  }
}

export type IntegrationResolvable = BaseResolvable<Integration>;

export interface AddIntegration {
  /**
   * The integration id.
   * @type {snowflake}
   */
  id: snowflake;

  /**
   * The integration type.
   * @type {string}
   */
  type: string;
}
