/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Permission } from "@neocord/utils";
import { Channel } from "../Channel";
import { ChannelOverwritePool } from "../../../pool/guild/ChannelOverwritePool";
import { PermissionOverwrite } from "../Overwrite";
import { exclude } from "../../../../utils";

import type { APIChannel, APIOverwrite } from "discord-api-types";
import type { Guild } from "../../guild/Guild";
import type { Client } from "../../../../client";
import type { CategoryChannel } from "./CategoryChannel";

export abstract class GuildChannel extends Channel {
  /**
   * The guild that this channel belongs to.
   *
   * @type {Guild}
   */
  public readonly guild: Guild;

  /**
   * The permission overwrites that belong to this channel.
   *
   * @type {ChannelOverwritePool}
   */
  public overwrites!: ChannelOverwritePool;

  /**
   * The ID of the parent category.
   *
   * @type {string}
   */
  public parentId!: string | null;

  /**
   * The name of this channel.
   *
   * @type {string}
   */
  public name!: string;

  /**
   * The sorting position of this channel.
   *
   * @type {number}
   */
  public position!: number | null;

  /**
   * Whether this channel is deleted.
   *
   * @type {boolean}
   */
  public deleted = false;

  /**
   * @param {Client} client The client instance.
   * @param {APIChannel} data The api channel.
   * @param {Guild} guild The guild instance.
   */
  public constructor(client: Client, data: APIChannel, guild: Guild) {
    super(client, data);

    this.guild = guild;
    this.overwrites = new ChannelOverwritePool(this);
  }

  /**
   * Whether the current user can view this channel.
   * @type {boolean}
   */
  public get viewable(): boolean {
    return this.guild.me.permissionsIn(this).has(Permission.ViewChannel);
  }

  /**
   * Whether the current user can manage this channel.
   * @type {boolean}
   */
  public get manageable(): boolean {
    return (
      this.viewable &&
      this.guild.me.permissionsIn(this).has(Permission.ManageChannels, false)
    );
  }

  /**
   * Deletes this guild channel.
   * @param {string} [reason] The reason for deleting this channel.
   *
   * @returns {Promise<Readonly<this>>}
   */
  public async delete(reason?: string): Promise<Readonly<this>> {
    await this.guild.channels.remove(this, reason);
    return this._freeze();
  }


  /**
   * Edit this channel.
   * @param {EditGuildChannel} data The channel modify options.
   * @param {string} [reason] The reason for updating this channel.
   *
   * @returns {this}
   */
  public async edit(data: EditGuildChannel, reason?: string): Promise<this> {
    const result = await this.client.rest.patch(
      `/channels/${this.id}`,
      {
        reason,
        body: {
          ...exclude(data, "permissionOverwrites", "parent"),
          permission_overwrites:
            data.permissionOverwrites &&
            data.permissionOverwrites.map((o) =>
              PermissionOverwrite.resolve(o, this.guild)
            ),
          parent_id: data.parent && this.guild.channels.resolveId(data.parent),
        }
      }
    );

    return this._patch(result as APIChannel);
  }

  /**
   * Updates this guild channel with data from the API.
   * @param {APIChannel} data
   *
   * @protected
   */
  protected _patch(data: APIChannel): this {
    this.name = data.name as string;
    this.position = data.position ?? null;
    this.parentId = data.parent_id ?? null;

    this.overwrites = new ChannelOverwritePool(this);
    if (data.permission_overwrites) {
      const overwrites = data.permission_overwrites ?? [];
      const existingOverwrites = this.overwrites.cache.clone();
      this.overwrites.cache.clear();

      for (const overwrite of overwrites) {
        const existing = existingOverwrites.find((o) => o.id === overwrite.id);
        if (existing) {
          this.overwrites["_set"](existing);
          existingOverwrites.delete(existing.id);
        }

        this.overwrites["_add"](overwrite);
      }

      existingOverwrites.forEach((o) => (o.deleted = true));
    }

    return this;
  }
}

export interface EditGuildChannel extends Dictionary {
  /**
   * The name of the channel.
   */
  name?: string;

  /**
   * The position of this channel.
   */
  position?: number | null;

  /**
   * The permission overwrites for this channel.
   */
  permissionOverwrites?: (PermissionOverwrite | APIOverwrite)[] | null;

  /**
   * The parent of this channel.
   */
  parent?: CategoryChannel | string;
}

