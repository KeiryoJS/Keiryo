/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { APIOverwrite, OverwriteType } from "discord-api-types";
import { Base } from "../Base";
import {
  DiscordStructure,
  Permission,
  PermissionResolvable,
  Permissions,
} from "../../util";
import { Role } from "./Role";

import type { Client } from "../../internal";
import type { GuildChannel } from "../channel/guild/GuildChannel";
import type { Guild } from "./Guild";

export class PermissionOverwrite extends Base {
  public readonly structureType = DiscordStructure.Overwrite;

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

  /**
   * The permissions this overwrite denies.
   * @type {Readonly<Permissions>}
   */
  public deny!: Readonly<Permissions>;

  /**
   * The permissions this overwrite allows.
   * @type {Readonly<Permissions>}
   */
  public allow!: Readonly<Permissions>;

  /**
   * Whether this permission overwrite has been deleted.
   * @type {boolean}
   */
  public deleted = false;

  /**
   * Creates a new instanceof PermissionOverwrite.
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
   * @returns {APIOverwrite} The resolved overwrite.
   */
  public static resolve(
    overwrite: PermissionOverwrite | APIOverwrite,
    guild: Guild
  ): APIOverwrite {
    if (overwrite instanceof PermissionOverwrite) overwrite.toJSON();
    if (["role", "member"].includes(overwrite.type)) {
      return {
        allow_new: Permissions.resolve(overwrite.allow).toString(),
        deny_new: Permissions.resolve(overwrite.deny).toString(),
        type: overwrite.type,
        id: overwrite.id as string,
      } as APIOverwrite;
    }

    const inst =
      guild.roles.get(overwrite.id) ?? guild.client.users.get(overwrite.id);
    if (!inst)
      throw new TypeError(`"${overwrite.id}" is neither a user or role`);

    return {
      type: inst instanceof Role ? OverwriteType.Role : OverwriteType.Member,
      id: overwrite.id,
      allow_new: Permissions.resolve(overwrite.allow).toString(),
      deny_new: Permissions.resolve(overwrite.deny).toString(),
    } as APIOverwrite;
  }

  /**
   * Resolve allow and deny permissions.
   * @param {Record<Permission, boolean | null>} options
   * @param {APIOverwrite} overwrite
   */
  private static resolveOverwriteData(
    options: Record<Permission, boolean | null>,
    overwrite: PermissionOverwrite
  ): { deny: Permissions; allow: Permissions } {
    const allow = new Permissions(overwrite.allow);
    const deny = new Permissions(overwrite.deny);

    for (const [_perm, v] of Object.entries(options)) {
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
   * @returns {PermissionOverwrite}
   */
  public async update(
    options: Record<Permission, boolean | null>,
    reason?: string
  ): Promise<PermissionOverwrite> {
    const { allow, deny } = PermissionOverwrite.resolveOverwriteData(
      options,
      this
    );

    const body = {
      type: this.type,
      allow_new: allow.bitmask.toString(),
      deny_new: deny.bitmask.toString(),
    };

    await this.client.api.put(
      `/channels/${this.channel.id}/permissions/${this.id}`,
      {
        body,
        reason,
      }
    );

    return this;
  }

  /**
   * The JSON representation of this overwrite.
   * @returns {APIOverwrite}
   */
  public toJSON(): APIOverwrite {
    return {
      id: this.id,
      type: this.type,
      deny_new: this.deny.bitmask.toString(),
      allow_new: this.allow.bitmask.toString(),
      deny: this.deny.bitmask,
      allow: this.allow.bitmask,
    } as APIOverwrite;
  }

  /**
   * Updates this permission overwrite with data from discord.
   * @protected
   */
  protected _patch(data: APIOverwrite): this {
    this.deny = new Permissions(+(data.deny_new ?? data.deny)).freeze();
    this.allow = new Permissions(+(data.allow_new ?? data.allow)).freeze();

    return this;
  }
}
