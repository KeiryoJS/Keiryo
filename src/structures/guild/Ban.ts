/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { SnowflakeBase } from "../SnowflakeBase";

import type { APIBan } from "discord-api-types";
import type { Guild } from "./Guild";
import type { User } from "../other/User";
import type { Client } from "../../internal";

export class Ban extends SnowflakeBase {
  /**
   * ID of the banned user.
   * @type {string}
   */
  public readonly id: string;

  /**
   * The reason for the ban.
   * @type {string | null}
   */
  public readonly reason: string | null;

  /**
   * The guild the ban belongs to.
   * @type {Guild}
   */
  public readonly guild: Guild;

  /**
   * Whether this ban has been deleted.
   * @type {boolean}
   */
  public deleted = false;

  /**
   * @param {Client} client The client instance.
   * @param {APIBan} data The ban data from discord.
   * @param {Guild} guild The guild instance.
   */
  public constructor(client: Client, data: APIBan, guild: Guild) {
    super(client);

    this.id = this.client.users["_add"](data.user).id;
    this.guild = guild;
    this.reason = data.reason;

    this._patch(data);
  }

  /**
   * The user that this ban is for.
   * @type {User}
   */
  public get user(): User | null {
    return this.client.users.get(this.id) ?? null;
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
