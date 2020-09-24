/*
 * Copyright (c) 2020 MeLike2D. All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Collection } from "@neocord/utils";
import { BaseManager, BaseResolvable } from "./BaseManager";
import { neo } from "../structures";
import { DiscordStructure, PermissionResolvable, Permissions } from "../util";

import type { APIRole, RESTGetAPIGuildRolesResult } from "discord-api-types";
import type { Role } from "../structures/guild/Role";
import type { Guild } from "../structures/guild/Guild";

export class RoleManager extends BaseManager<Role> {
  /**
   * The guild this role manager belongs to.
   * @type {Guild}
   */
  public readonly guild: Guild;

  /**
   * Creates a new instanceof RoleManager.
   * @param {Guild} guild The guild this role manager belongs to.
   */
  public constructor(guild: Guild) {
    super(guild.client, {
      class: neo.get("Role"),
      structure: DiscordStructure.Role,
    });

    this.guild = guild;
  }

  /**
   * The highest role based on position in this store.
   * @type {Role | null}
   */
  public get highest(): Role | null {
    return this.reduce(
      (h, r) => (h.position > r.position ? h : r),
      this.first as Role
    );
  }

  /**
   * Add a role to this store.
   * @param {RoleAddOptions} data The role data.
   * @param {string} [reason] The reason for adding this role..
   */
  public async add(data: RoleAddOptions, reason?: string): Promise<Role> {
    const body = {
      ...data,
      permissions: Permissions.resolve(data.permissions),
    };

    const role = await this.client.api.post<APIRole>(
      `/guilds/${this.guild.id}/roles`,
      {
        body,
        reason,
      }
    );

    return this._add(role);
  }

  /**
   * Removes a role from the role list.
   * @param {BaseResolvable} role The role to remove.
   * @param {string} [reason] The reason for removing the role.
   */
  public async remove(
    role: RoleResolvable,
    reason?: string
  ): Promise<Role | null> {
    const r = this.resolve(role);
    if (r)
      await this.client.api.delete(`/guilds/${this.guild.id}/roles/${r.id}`, {
        reason,
      });
    return r;
  }

  /**
   * Fetches a role from the discord api.
   * @param {string} role The ID of the role to fetch.
   * @param {boolean} [force] Skip checking if the role is already cached.
   * @returns {Promise<Role>} The fetched role.
   */
  public fetch(role: string, force?: boolean): Promise<Role>;

  /**
   * Fetches all roles for the guild.
   * @returns {Promise<Collection<string, Role>>}
   */
  public fetch(): Promise<Collection<string, Role>>;

  /**
   * Fetches a role or roles from the api.
   * @param {string} [role] The role to fetch
   * @param {boolean} [force] Whether to skip checking if the role is already cached.
   */
  public async fetch(
    role?: string,
    force?: boolean
  ): Promise<Collection<string, Role> | Role> {
    if (role) {
      if (!force) {
        const cached = this.get(role);
        if (cached) return cached;
      }

      const data = await this.client.api.get<APIRole>(
        `/guilds/${this.guild.id}/roles/${role}`
      );
      return this._add(data);
    }

    const col = new Collection<string, Role>(),
      roles = await this.client.api.get(`/guilds/${this.guild.id}/roles`);

    for (const data of roles as RESTGetAPIGuildRolesResult) {
      const role = this._add(data);
      col.set(role.id, role);
    }

    return col;
  }
}

export type RoleResolvable = BaseResolvable<Role>;

export interface RoleAddOptions {
  name?: string;
  permissions?: PermissionResolvable | number;
  color?: string | number;
  hoisted?: boolean;
  mentionable?: boolean;
}
