/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { APIOverwrite, OverwriteType } from "discord-api-types";
import { Base } from "../Base";
import { Permissions } from "../../util";
import { Role } from "./Role";

import type { Client } from "../../lib";
import type { GuildChannel } from "../channel/guild/GuildChannel";
import type { Guild } from "./Guild";

export class PermissionOverwrite extends Base {
  /**
   * The role or user ID.
   * @type {string}
   */
  public readonly id: string;

  /**
   * The guild channel that this permission overwrite belongs to.
   * @type {GuildChannel}
   */
  public readonly channel: GuildChannel;

  /**
   * Either "role" or "member"
   * @type {OverwriteType}
   */
  public readonly type: OverwriteType;

  public deny!: Permissions;

  public allow!: Permissions;

  /**
   * Creates a new instanceof PermissionOverwrite.
   * @param {Client} client The client instance.
   * @param {APIOverwrite} data The overwrite data from discord.
   * @param {GuildChannel} channel The guild channel that this permission overwrite belongs to.
   */
  public constructor(client: Client, data: APIOverwrite, channel: GuildChannel) {
    super(client);

    this.id = data.id;
    this.channel = channel;
    this.type = data.type;

    this._patch(data);
  }

  /**
   * Resolves an overwrite into an object.
   * @param {PermissionOverwrite | APIOverwrite} overwrite The permission overwrite instance.
   * @param {Guild} guild The guild instance.
   * @returns {APIOverwrite} The resolved overwrite.
   */
  public static resolve(overwrite: PermissionOverwrite | APIOverwrite, guild: Guild): APIOverwrite {
    if (overwrite instanceof PermissionOverwrite) overwrite.toJSON();
    if ([ "role", "member" ].includes(overwrite.type)) {
      const allow = Permissions.resolve(overwrite.allow),
        deny = Permissions.resolve(overwrite.deny);
      return {
        allow_new: allow.toString(),
        deny_new: deny.toString(),
        allow, deny,
        type: overwrite.type,
        id: overwrite.id as string
      };
    }

    const inst = guild.roles.get(overwrite.id) ?? guild.client.users.get(overwrite.id);
    if (!inst) throw new TypeError(`"${overwrite.id}" is neither a user or role`);

    const type = inst instanceof Role ? OverwriteType.Role : OverwriteType.Member,
      allow = Permissions.resolve(overwrite.allow),
      deny = Permissions.resolve(overwrite.deny);

    return {
      type, allow, deny,
      id: overwrite.id,
      allow_new: allow.toString(),
      deny_new: deny.toString()
    };
  }

  /**
   * Updates this permission overwrite with data from discord.
   * @protected
   */
  protected _patch(data: APIOverwrite): this {
    this.deny = new Permissions(+data.deny_new).freeze();
    this.allow = new Permissions(+data.allow_new).freeze();

    return this;
  }
}
