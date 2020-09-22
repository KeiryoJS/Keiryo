/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Collection } from "@neocord/utils";
import { BaseGuildEmoji } from "./Base";

import type { APIEmoji } from "discord-api-types";
import type { Member } from "../Member";
import type { Role } from "../Role";

export class GuildEmoji extends BaseGuildEmoji {
  /**
   * The member that created this guild emoji.
   * @type {Member}
   */
  public author?: Member;

  /**
   * Roles this emoji is whitelisted to.
   * @type {Collection<string, Role>}
   */
  public get roles(): Collection<string, Role> {
    const col = new Collection<string, Role>();
    if (this._roles) {
      for (const id of this._roles) {
        const role = this.guild.roles.get(id);
        if (role) col.set(id, role);
      }
    }

    return col;
  }

  /**
   * Updates this guild emoji with data from discord.
   * @protected
   */
  protected _patch(data: APIEmoji): this {
    if (data.user) {
      this.client.users["_add"](data.user);
      this.author = this.guild.members.get(data.user.id);
    }

    return super._patch(data);
  }
}
