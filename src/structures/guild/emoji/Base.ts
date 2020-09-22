/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Emoji } from "../../other/Emoji";

import type { Client } from "../../../internal";
import type { Guild } from "../Guild";
import type { APIEmoji } from "discord-api-types";
import { has } from "@neocord/utils";

export class BaseGuildEmoji extends Emoji {
  /**
   * The ID of this emoji.
   * @type {string}
   */
  public readonly id!: string;

  /**
   * The guild that this emoji belongs to.
   * @type {Guild}
   */
  public readonly guild: Guild;

  /**
   * Whether this emoji must be wrapped in colons
   * @type {?boolean}
   */
  public requireColons?: boolean;

  /**
   * Whether this emoji is managed.
   * @type {?boolean}
   */
  public managed?: boolean;

  /**
   * Whether this emoji can be used, may be false due to loss of Server Boosts
   * @type {?boolean}
   */
  public available?: boolean;

  /**
   * Roles this emoji is whitelisted to.
   * @type {?Array<string>}
   * @protected
   */
  protected _roles?: string[];

  /**
   *
   * @param {Client} client
   * @param {APIEmoji} data
   * @param {Guild} guild
   */
  public constructor(client: Client, data: APIEmoji, guild: Guild) {
    super(client, data);

    this.guild = guild;
    this._patch(data);
  }

  /**
   * Updates this role with data from discord.
   * @protected
   */
  protected _patch(data: APIEmoji): this {
    if (data.name) this.name = data.name;
    if (has(data, "require_colons")) this.requireColons = data.require_colons;
    if (has(data, "managed")) this.managed = data.managed;
    if (has(data, "available")) this.available = data.available;
    if (data.roles) this._roles = data.roles;

    return super._patch(data);
  }
}
