/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { SnowflakeBase } from "../SnowflakeBase";

import type { Guild } from "./Guild";
import type { APIBan } from "discord-api-types";

export class Ban extends SnowflakeBase {
  /**
   * ID of the banned user.
   */
  public readonly id: string;

  /**
   * The reason for the ban.
   */
  public readonly reason: string | null;

  /**
   * The guild the ban belongs to.
   */
  public readonly guild: Guild;

  /**
   * Whether this ban has been deleted.
   */
  public deleted = false;

  /**
   * Creates a new instanceof Ban.
   * @param {Guild} guild The guild instance.
   * @param {APIBan} data The ban data from discord.
   */
  public constructor(guild: Guild, data: APIBan) {
    super(guild.client);

    this.id = this.client.users["_add"](data.user).id;
    this.guild = guild;
    this.reason = data.reason;

    this._patch(data);
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
