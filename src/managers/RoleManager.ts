/*
 * Copyright (c) 2020 MeLike2D. All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { BaseManager, BaseResolvable } from "./BaseManager";
import { neo } from "../structures/Extender";
import { PermissionResolvable, Permissions } from "../util";

import type { RESTGetAPIGuildRolesResult } from "discord-api-types";
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
    super(guild.client, neo.get("Role"));

    this.guild = guild;
  }

  /**
   * The total amount roles that can be cached at one time.
   * @returns {number}
   */
  public get limit(): number {
    return Infinity; // TODO: get role limit from the client.
  }

  /**
   * The highest role based on position in this store.
   * @type {Role | null}
   */
  public get highest(): Role | null {
    return this.reduce((h, r) => h.position > r.position ? h : r, this.first as Role);
  }

  /**
   * Add a role to this store.
   * @param {RoleAddOptions} data The role data.
   * @param {string} [reason] The reason for adding this role..
   */
  public async new(data: RoleAddOptions, reason?: string): Promise<Role> {
    const body = {
      ...data,
      permissions: Permissions.resolve(data.permissions)
    };

    const role = await this.client.api.post(`/guilds/${this.guild.id}/roles`, {
      body,
      reason
    });

    return this._add(role);
  }

  /**
   * Removes a role from the role list.
   * @param {BaseResolvable} role The role to remove.
   * @param {string} [reason] The reason for removing the role.
   */
  public async remove(role: BaseResolvable<Role>, reason?: string): Promise<Role | null> {
    const r = this.resolve(role);
    if (r) await this.client.api.delete(`/guilds/${this.guild.id}/roles/${r.id}`, { reason });
    return r;
  }

  /**
   * Fetches a role from the discord api.
   * @param {string} role The ID of the role to fetch.
   * @returns {Role} The fetched role.
   */
  public async fetch(role: string): Promise<Role>;
  /**
   * Fetches all roles for the guild.
   * @returns {RoleManager}
   */
  public async fetch(): Promise<RoleManager>;
  public async fetch(role?: string): Promise<RoleManager | Role> {
    if (role) {
      const data = await this.client.api.get(`/guilds/${this.guild.id}/roles/${role}`);
      return this._add(data);
    }

    const roles = await this.client.api.get<RESTGetAPIGuildRolesResult>(`/guilds/${this.guild.id}/roles`);
    for (const role of roles) {
      this._add(role);
    }

    return this;
  }
}

export interface RoleAddOptions {
  name?: string;
  permissions?: PermissionResolvable | number;
  color?: string | number;
  hoisted?: boolean;
  mentionable?: boolean;
}
