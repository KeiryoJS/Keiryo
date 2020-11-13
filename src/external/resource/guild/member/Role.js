/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Permissions } from "@neocord/utils";
import { Resource } from "../../../abstract/Resource";
import { parseColor } from "../../../../utils";

export class Role extends Resource {
  /**
   * @param {Client} client The client instance.
   * @param {Object} data The role data.
   * @param {Guild} guild The guild instance.
   */
  constructor(client, data, guild) {
    super(client);

    /**
     * The ID of this role.
     * @type {string}
     */
    this.id = data.id;

    /**
     * The guild that this role belongs to.
     * @type {Guild}
     */
    this.guild = guild;

    /**
     * Whether this role has been deleted.
     * @type {boolean}
     */
    this.deleted = false;

    this._patch(data);
  }

  /**
   * Whether this role is @everyone.
   * @return {boolean}
   */
  get everyone() {
    return this.id === this.guild.id;
  }

  /**
   * All of the guild members that have this role.
   * @return {Collection<string, Member>}
   */
  get members() {
    return this.guild.members.filter(mem => mem.roles.has(this.id));
  }

  /**
   * The mention string for this role.
   * @return {string}
   */
  get mention() {
    return this.everyone ? "@everyone" : `<@&${this.id}>`;
  }

  /**
   * Deletes the role from the guild.
   * @param {string} [reason] Reason for deleting this role.
   * @return {Promise<this>}
   */
  async delete(reason) {
    await this.guild.roles.remove(this, reason);
    this.deleted = true;
    return this._freeze();
  }

  /**
   * Edits this role.
   * @param {RoleUpdateData} data The data to update this role with.
   * @param {string} [reason] Reason for updating this role.
   * @return {Promise<this>}
   */
  async edit(data, reason) {
    if (Reflect.has(data, "color")) {
      data.color = parseColor(data.color);
    }

    if (Reflect.has(data, "permissions")) {
      data.permissions = Permissions.resolve(data.permissions);
    }

    const resp = await this.client.rest.patch({
      reason,
      data
    });

    return this._patch(resp);
  }

  /**
   * The string representation of this role.
   * @return {string}
   */
  toString() {
    return this.mention;
  }

  /**
   * Add this role to a guild member.
   * @param {MemberLike} target The target member.
   * @param {string} [reason] The reason for adding the role.
   * @returns {Promise<Role>}
   */
  async addTo(target, reason) {
    const member = this.guild.members.resolve(target);
    if (member) {
      await member.roles.remove(this, reason);
    }

    return this;
  }

  /**
   * Remove this role to a guild member.
   * @param {MemberLike} target The target member.
   * @param {string} [reason] The reason for removing the role.
   *
   * @returns {Promise<Role>}
   */
  async removeFrom(target, reason) {
    const member = this.guild.members.resolve(target);
    if (member) {
      await member.roles.add(this, reason);
    }

    return this;
  }

  /**
   * Checks permissions for this member in a given channel.
   * @param {GuildChannel} channel The channel to check permissions in.
   * @param {boolean} [guildScope] Whether to take into account guild scoped permissions, or just overwrites.
   * @returns {Permissions}
   */
  permissionsIn(channel, guildScope = true) {
    const { permissions } = this;

    if (permissions.has(Permissions.FLAGS.Administrator))
      return new Permissions(Permissions.ALL).freeze();

    const guildScopePermissions = guildScope ? permissions.mask(Permissions.GUILD_SCOPE_PERMISSIONS) : 0,
      overwrites = channel.overwrites.for(this);

    return permissions
      .remove(overwrites.everyone ? overwrites.everyone.deny : 0)
      .add(overwrites.everyone ? overwrites.everyone.allow : 0)
      .remove(overwrites.role ? overwrites.role.deny : 0)
      .add(overwrites.role ? overwrites.role.allow : 0)
      .add(guildScopePermissions)
      .freeze();
  }

  /**
   * Updates this role with data from Discord.
   * @param {Object} data The role data.
   * @private
   */
  _patch(data) {
    /**
     * The color of this role.
     * @type {number}
     */
    this.color = data.color;

    /**
     * Whether the role should be displayed separately in the sidebar
     * @type {boolean}
     */
    this.hoisted = data.hoisted;

    /**
     * Whether this role is managed by an integration
     * @type {boolean}
     */
    this.managed = data.managed;

    /**
     * Whether the role should be mentionable
     * @type {boolean}
     */
    this.mentionable = data.mentionable;

    /**
     * Name of the role.
     * @type {string}
     */
    this.name = data.name;

    /**
     * Position of this role
     * @type {number}
     */
    this.position = data.position;

    if (Reflect.has(data, "tags")) {
      /**
       * The tags for this role.
       * @type {RoleTags}
       */
      this.tags = {
        botId: data.tags.bot_id,
        premiumSubscriber: data.tags.premium_subscriber,
        integrationId: data.tags.integration_id
      };
    }

    /**
     * The permissions for this role.
     * @type {Permissions}
     */
    this.permissions = new Permissions(~~data.permissions).freeze();
  }
}

/**
 * @typedef {Object} RoleUpdateData
 * @prop {string} [name] New name of the role.
 * @prop {PermissionResolvable} [permissions] The permissions this role will have,
 * @prop {ColorResolvable} [color] The color of this role.
 * @prop {boolean} [hoisted] Whether tis role should be displayed separately in the sidebar.
 * @prop {boolean} [mentionable] Whether this role should be mentionable.
 */

/**
 * @typedef {Object} RoleTags
 * @property {string} [botId]
 * @property {*} [premiumSubscriber]
 * @property {string} [integrationId]
 */
