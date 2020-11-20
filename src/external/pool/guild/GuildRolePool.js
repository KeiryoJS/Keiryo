/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ResourcePool } from "../../abstract/ResourcePool";
import { resources } from "../../resource/Resources";
import { exclude, parseColor, Permissions } from "../../../utils";

export class GuildRolePool extends ResourcePool {
  /**
   * @param {Guild} guild The guild that this role pool belongs to.
   */
  constructor(guild) {
    super(guild.client, {
      limit: guild.client.caching.limitFor("role"),
      class: resources.get("Role")
    });

    /**
     * The guild that this role pool belongs to.
     * @type {Guild}
     * @readonly
     */
    Object.defineProperty(this, "guild", {
      value: guild,
      configurable: false,
      writable: false
    });
  }

  /**
   * The highest role based on position in the guild.
   * @type {Role}
   */
  get highest() {
    return this.reduce((h, r) => h.position > r.position ? h : r, this.first()[1]);
  }

  /**
   * Removes a role from the guild.
   * @param {Role | string} role The role to remove.
   * @param {string} [reason] The reason that this role was removed.
   * @return {Promise<boolean>} Whether the role was removed.
   */
  async remove(role, reason) {
    const id = this.resolveId(role);
    if (id) {
      await this.client.rest.delete(`/guilds/${this.guild.id}/roles/${id}`, {
        reason
      });

      return true;
    }

    throw new Error("Couldn't resolve a Role ID from the provided value.");
  }

  /**
   * Creates a new role in the guild.
   * @param {RoleCreateData} data The role data.
   * @param reason
   * @return {Promise<Resource>}
   */
  async create(data, reason) {
    const role = await this.client.rest.post(`/guilds/${this.guild.id}/roles`, {
      reason,
      data: {
        ...exclude(data, "permissions", "color"),
        permissions: Permissions.resolve(data.permissions),
        color: data.color ? parseColor(data.color) : 0
      }
    });

    return this.add(role);
  }

  /**
   * Fetches a role from the Discord API.
   * @param {string} id ID of the role to fetch.
   * @param {FetchOptions} [options] The fetch options.
   * @returns {Promise<Role>} The fetched role.
   */
  async fetch(id, { force, cache } = { force: false, cache: true }) {
    if (!force && this.has(id)) {
      return this.get(id);
    }

    const data = await this.client.rest.queue({
      endpoint: `/guilds/${this.guild.me}/roles/${id}`
    });

    return cache ? this.add(data) : this._create(data);
  }

  /**
   * Creates a new role.
   * @param {Object} data The role data from discord.
   * @param {...any} args The arguments that will be passed to the constructor.
   * @returns {Role}
   */
  _create(data, ...args) {
    return new (this.class)(this.client, data, this.guild, ...args);
  }
}

/**
 * @typedef {Object} RoleCreateData
 * @prop {string} [name] The name of the role.
 * @prop {PermissionResolvable} [permissions] The permissions this role will have.
 * @prop {ColorResolvable} [color] The color of this role.
 * @prop {boolean} [hoist] Whether the role should be displayed separately in the sidebar.
 * @prop {boolean} [mentionable] Whether the role should be mentionable.
 */
