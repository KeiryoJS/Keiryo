/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { BaseManager, BaseResolvable, CLASS } from "./BaseManager";
import { neo } from "../structures";
import { DiscordStructure } from "../util";

import type {
  APIExtendedInvite,
  APIInvite,
  APIPartialChannel,
} from "discord-api-types";
import type { Invite } from "../structures/other/Invite";
import type { Client } from "../internal";

export class InviteManager extends BaseManager<Invite> {
  /**
   * @param {Client} client The client instance.
   */
  public constructor(client: Client) {
    super(client, {
      structure: DiscordStructure.Invite,
      class: neo.get("Invite"),
    });
  }

  /**
   * Deletes an invite.
   * @param {InviteResolvable} invite The invite to delete.
   * @returns {Promise<Readonly<Invite> | null>} The invite to delete.
   */
  public async remove(
    invite: InviteResolvable
  ): Promise<Readonly<Invite> | null> {
    const id = this.resolveId(invite);
    if (!id) return null;

    const d = await this.client.api.delete(`/invites/${id}`);
    const channel = this.client.channels.get(
      (d.channel as APIPartialChannel).id
    );
    const guild = d.guild ? this.client.guilds.get(d.guild.id) : null;

    return new this[CLASS](channel, d, guild)._freeze();
  }

  /**
   * Fetches an invite from the API.
   * @param {string} code The invite code.
   * @param {boolean} [withCounts] Whether the invite should include counts.
   * @returns {Promise<Invite>}
   */
  public async fetch(code: string, withCounts?: boolean): Promise<Invite> {
    const invite = await this.client.api.get<APIExtendedInvite>(
      `/invites/${code}`,
      {
        query: { with_counts: !!withCounts },
      }
    );

    return this._add(invite);
  }

  /**
   * Adds a new invite to the cache.
   * @param {APIExtendedInvite} data The data packet to add
   */
  protected _add(data: APIInvite | APIExtendedInvite): Invite {
    const existing = this.get(data.code);
    if (existing) return existing["_patch"](data);

    const guild = data.guild ? this.client.guilds.get(data.guild.id) : null;
    const channel = this.client.channels.get(
      (data.channel as APIPartialChannel).id
    );
    return this._set(new this[CLASS](channel, data, guild));
  }
}

export type InviteResolvable = BaseResolvable<Invite>;
