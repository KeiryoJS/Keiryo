/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Permission, PermissionResolvable, Permissions } from "@neocord/utils";
import { APIOverwrite, OverwriteType } from "discord-api-types";
import { Resource } from "../../abstract";
import { Role } from "../guild/member/Role";

import type { GuildChannel } from "./guild/GuildChannel";
import type { Guild } from "../guild/Guild";
import type { Client } from "../../../client";

export class PermissionOverwrite extends Resource {
  /**
   * The role or user ID.
   *
   * @type {string}
   */
  public readonly id: string;

  /**
   * The guild channel that this permission overwrite belongs to.
   *
   * @type {GuildChannel}
   */
  public readonly channel: GuildChannel;

  /**
   * Either "role" or "member"
   *
   * @type {OverwriteType}
   */
  public readonly type: OverwriteType;

  /**
   * The permissions this overwrite denies.
   *
   * @type {Readonly<Permissions>}
   */
  public deny!: Readonly<Permissions>;

  /**
   * The permissions this overwrite allows.
   *
   * @type {Readonly<Permissions>}
   */
  public allow!: Readonly<Permissions>;

  /**
   * Whether this permission overwrite has been deleted.
   *
   * @type {boolean}
   */
  public deleted = false;

  /**
   * @param {Client} client The client instance.
   * @param {APIOverwrite} data The overwrite data from discord.
   * @param {GuildChannel} channel The guild channel that this permission overwrite belongs to.
   */
  public constructor(
    client: Client,
    data: APIOverwrite,
    channel: GuildChannel
  ) {
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
   *
   * @returns {APIOverwrite} The resolved overwrite.
   */
  public static resolve(
    overwrite: PermissionOverwrite | APIOverwrite,
    guild: Guild
  ): APIOverwrite {
    if (overwrite instanceof PermissionOverwrite) overwrite.toJSON();
    if ([ OverwriteType.Member, OverwriteType.Role ].includes(overwrite.type)) {
      return {
        allow: Permissions.resolve(overwrite.allow).toString(),
        deny: Permissions.resolve(overwrite.deny).toString(),
        type: overwrite.type,
        id: overwrite.id as string
      };
    }

    const inst =
      guild.roles.cache.get(overwrite.id) ?? guild.client.users.cache.get(overwrite.id);
    if (!inst)
      throw new TypeError(`"${overwrite.id}" is neither a user or role`);

    return {
      type: inst instanceof Role ? OverwriteType.Role : OverwriteType.Member,
      id: overwrite.id,
      allow: Permissions.resolve(overwrite.allow).toString(),
      deny: Permissions.resolve(overwrite.deny).toString()
    };
  }

  /**
   * Resolve allow and deny permissions.
   * @param {Record<Permission, boolean | null>} options
   * @param {APIOverwrite} overwrite The permission overwrite.
   */
  private static resolveOverwriteData(
    options: Record<Permission, boolean | null>,
    overwrite: PermissionOverwrite
  ): { deny: Permissions; allow: Permissions } {
    const allow = new Permissions(overwrite.allow);
    const deny = new Permissions(overwrite.deny);

    for (const [ _perm, v ] of Object.entries(options)) {
      const perm = _perm as PermissionResolvable;
      if (v) {
        allow.add(perm);
        deny.remove(perm);
      } else if (v === null) {
        allow.remove(perm);
        deny.remove(perm);
      } else if (!v) {
        deny.add(perm);
        allow.remove(perm);
      }
    }

    return { allow, deny };
  }

  /**
   * Update this permission overwrite
   * @param {Record<Permission, boolean | null>} options The options for the update.
   * @param {string} [reason] Reason for creating/editing this overwrite.
   *
   * @returns {PermissionOverwrite}
   */
  public async edit(
    options: Record<Permission, boolean | null>,
    reason?: string
  ): Promise<PermissionOverwrite> {
    const { allow, deny } = PermissionOverwrite.resolveOverwriteData(
      options,
      this
    );

    const body = {
      type: this.type,
      allow: allow.bitmask.toString(),
      deny: deny.bitmask.toString()
    };

    await this.client.rest.put(
      `/channels/${this.channel.id}/permissions/${this.id}`,
      {
        body,
        reason
      }
    );

    return this;
  }

  /**
   * The JSON representation of this overwrite.
   *
   * @returns {APIOverwrite}
   */
  public toJSON(): APIOverwrite {
    return {
      id: this.id,
      type: this.type,
      deny: this.deny.bitmask.toString(),
      allow: this.allow.bitmask.toString()
    };
  }

  /**
   * Updates this permission overwrite with data from discord.
   * @param {APIOverwrite} data from discord.
   *
   * @protected
   */
  protected _patch(data: APIOverwrite): this {
    this.deny = new Permissions(+data.deny).freeze();
    this.allow = new Permissions(+data.allow).freeze();

    return this;
  }
}