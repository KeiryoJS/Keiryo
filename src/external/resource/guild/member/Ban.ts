/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { SnowflakeResource } from "../../../abstract/Resource";

import type { APIBan } from "discord-api-types";
import type { Client } from "../../../../client";
import type { User } from "../../user/User";
import type { Guild } from "../Guild";

export class Ban extends SnowflakeResource {
  /**
   * ID of the user that this ban is for.
   *
   * @type {string}
   */
  public readonly id: string;

  /**
   * The reason for the ban.
   *
   * @type {string | null}
   */
  public readonly reason: string | null;

  /**
   * Whether this ban has been deleted.
   *
   * @type {boolean}
   */
  public deleted = false;

  /**
   * The guild that this ban belongs to.
   *
   * @type {Guild}
   * @private
   */
  readonly #guild: Guild;

  /**
   * @param {Client} client The client instance.
   * @param {APIBan} data The ban data.
   * @param {Guild} guild The guild.
   */
  public constructor(client: Client, data: APIBan, guild: Guild) {
    super(client);

    this.id = client.users["_add"](data.user).id;
    this.reason = data.reason;

    this.#guild = guild;
  }

  /**
   * The guild that this ban belongs to.
   *
   * @type {Guild}
   */
  public get guild(): Guild {
    return this.#guild;
  }

  /**
   * The user that this ban is for.
   *
   * @type {User}
   */
  public get user(): User | null {
    return this.client.users.resolve(this.id) ?? null;
  }

  /**
   * Deletes this ban. (unban's the user)
   * @param {string} [reason] Reason for unbanning the user.
   * @returns {Ban}
   */
  public async delete(reason: string): Promise<this> {
    await this.guild.bans.remove(this.id, reason);
    this.deleted = true;

    return this;
  }
}