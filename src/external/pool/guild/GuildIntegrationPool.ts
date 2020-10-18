/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ResourceLike, ResourcePool, ResourceType } from "../../abstract";
import { resources } from "../../resource/Resources";

import type { snowflake } from "@neocord/utils";
import type { Integration } from "../../resource/guild/Integration";
import type { Guild } from "../../resource/guild/Guild";

export class GuildIntegrationPool extends ResourcePool<Integration> {
  /**
   * The guild this channel pool belongs to.
   *
   * @type {Guild}
   */
  readonly #guild: Guild;

  /**
   * @param {Guild} guild The {@link Guild guild} instance.
   */
  public constructor(guild: Guild) {
    super(guild.client, {
      class: resources.get("Integration"),
      resource: ResourceType.Integration
    });

    this.#guild = guild;
  }

  /**
   * The guild this channel cache belongs to.
   *
   * @type {Guild}
   */
  public get guild(): Guild {
    return this.#guild;
  }

  /**
   * Add a new guild integration.
   * @param {string} id ID of the integration
   * @param {string} type The type of integration
   *
   * @returns {Promise<Integration>}
   */
  public async add(id: string, type: string): Promise<Integration> {
    const integration = await this.client.rest.post(
      `/guilds/${this.guild.id}/integrations`,
      {
        body: {
          id,
          type
        }
      }
    );

    return this._add(integration, this.guild);
  }

  /**
   * Removes an integration from the guild.
   * @param {IntegrationLike} integration The integration to remove.
   * @param {string} [reason] Reason for deleting the integration.
   *
   * @returns {Promise<this>}
   */
  public async remove<I extends IntegrationLike>(integration: I, reason?: string): Promise<I> {
    const id = this.resolveId(integration);
    if (id) {
      await this.client.rest.delete(
        `/guilds/${this.guild.id}/integrations/${id}`,
        {
          reason
        }
      );

      this.cache.delete(id);
      return integration;
    }

    throw new Error(`Can't resolve ${integration} into an ID.`);
  }

}

export type IntegrationLike = ResourceLike<Integration>;

export interface AddIntegration {
  /**
   * The integration id.
   */
  id: snowflake;

  /**
   * The integration type.
   */
  type: string;
}

