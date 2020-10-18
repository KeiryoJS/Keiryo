/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { PermissionResolvable, Permissions } from "@neocord/utils";
import { ResourceLike, ResourcePool, ResourceType } from "../../abstract";
import { resources } from "../../resource/Resources";

import type { APIRole } from "discord-api-types";
import type { Role } from "../../resource/guild/member/Role";
import type { Guild } from "../../resource/guild/Guild";
import type { ColorResolvable } from "../../../utils";

export class GuildRolePool extends ResourcePool<Role> {
  /**
   * The guild that this pool belongs to.
   *
   * @type {Guild}
   * @private
   */
  readonly #guild: Guild;

  /**
   * @param {Guild} guild The guild instance.
   */
  public constructor(guild: Guild) {
    super(guild.client, {
      class: resources.get("Role"),
      resource: ResourceType.Role
    });

    this.#guild = guild;
  }

  /**
   * The guild that this pool belongs to.
   *
   * @type {Guild}
   */
  public get guild(): Guild {
    return this.#guild;
  }

  /**
   * The highest role based on position in this store.
   *
   * @type {Role | null}
   */
  public get highest(): Role | null {
    return this.cache.reduce(
      (h, r) => (h.position > r.position ? h : r),
      this.cache.first()?.[1] as Role
    );
  }

  /**
   * Removes a role from the role list.
   * @param {RoleLike} role The role to remove.
   * @param {string} [reason] The reason for removing the role.
   *
   * @returns {Promise<RoleLike>}
   */
  public async remove<R extends RoleLike>(role: R, reason?: string): Promise<R> {
    const r = this.resolveId(role);
    if (r) {
      await this.client.rest.delete(`/guilds/${this.guild.id}/roles/${r}`, {
        reason
      });

      return role;
    }

    throw new Error("Couldn't resolve a role Id.");
  }

  /**
   * Add a role to this store.
   * @param {RoleAddOptions} data The role data.
   * @param {string} [reason] The reason for adding this role.
   *
   * @returns {Promise<Role>}
   */
  public async create(data: RoleAddOptions, reason?: string): Promise<Role> {
    const body = {
      ...data,
      permissions: Permissions.resolve(data.permissions)
    };

    const role = await this.client.rest.post<APIRole>(`/guilds/${this.guild.id}/roles`, {
      body,
      reason
    });

    return this._add(role);
  }
}

export type RoleLike = ResourceLike<Role>;

export interface RoleAddOptions {
  /**
   * The name of this role.
   */
  name?: string;

  /**
   * The permissions for this role.
   */
  permissions?: PermissionResolvable | number;

  /**
   * The color of this role.
   */
  color?: ColorResolvable;

  /**
   * Whether this role is hoisted.
   */
  hoisted?: boolean;

  /**
   * Whether this role is mentionable.
   */
  mentionable?: boolean;
}

