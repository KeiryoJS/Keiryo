/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Channel } from "../Channel";
import { PermissionOverwrite } from "../../guild/PermissionOverwrite";
import { OverwriteManager } from "../../../managers";

import type { CategoryChannel } from "./CategoryChannel";
import type {
  APIChannel,
  APIOverwrite,
  RESTPatchAPIChannelResult,
} from "discord-api-types/default";
import type { Client } from "../../../internal";
import type { Guild } from "../../guild/Guild";

export abstract class GuildChannel extends Channel {
  /**
   * The guild that this channel belongs to.
   * @type {Guild}
   */
  public readonly guild: Guild;

  /**
   * The permission overwrites that belong to this channel.
   * @type {OverwriteManager}
   */
  public overwrites!: OverwriteManager;

  /**
   * The name of this channel.
   * @type {string}
   */
  public name!: string;

  /**
   * The sorting position of this channel.
   * @type {number}
   */
  public position!: number;

  /**
   * The ID of the parent category.
   * @type {string}
   */
  public parentId!: string | null;

  /**
   * Whether this channel is deleted.
   * @type {boolean}
   */
  public deleted = false;

  /**
   * Creates a new instanceof GuildChannel.
   * @param {Client} client The client instance.
   * @param {APIChannel} data The data returned from the api.
   * @param {Guild} [guild] The guild instance.
   */
  public constructor(client: Client, data: APIChannel, guild?: Guild) {
    super(client, data);

    this.guild = guild ?? (client.guilds.get(data.guild_id as string) as Guild);
  }

  /**
   * Get the parent category of this channel.
   * @type {CategoryChannel | null}
   */
  public get parent(): CategoryChannel | null {
    return this.parentId
      ? this.guild.channels.get<CategoryChannel>(this.parentId) ?? null
      : null;
  }

  /**
   * Deletes this guild channel.
   * @param {string} [reason] The reason for deleting this channel.
   * @returns {Promise<Readonly<this>>}
   */
  public async delete(reason?: string): Promise<Readonly<this>> {
    await this.guild.channels.remove(this, reason);
    return this.freeze();
  }

  /**
   * Modifies this channel.
   * @param {ModifyGuildChannel} data The channel modify options.
   * @param {string} [reason] The reason for updating this channel.
   */
  public async modify(
    data: ModifyGuildChannel,
    reason?: string
  ): Promise<this> {
    const result = await this.client.api.patch<RESTPatchAPIChannelResult>(
      `/channels/${this.id}`,
      {
        reason,
        body: {
          name: data.name,
          position: data.position,
          permission_overwrites: data.permissionOverwrites
            ? data.permissionOverwrites.map((o) =>
              PermissionOverwrite.resolve(o, this.guild)
            )
            : data.permissionOverwrites,
          parent_id: data.parent
            ? this.guild.channels.resolveId(data.parent)
            : data.parent,
        },
      }
    );

    return this._patch(result);
  }

  /**
   * Updates this guild channel with data from the API.
   * @param {APIChannel} data
   * @protected
   */
  protected _patch(data: APIChannel): this {
    this.name = data.name as string;
    this.position = data.position;
    this.parentId = data.parent_id ?? null;

    this.overwrites = new OverwriteManager(this);
    if (data.permission_overwrites) {
      const overwrites = data.permission_overwrites ?? [];
      const existingOverwrites = this.overwrites.clone();
      this.overwrites.clear();

      for (const overwrite of overwrites) {
        const existing = existingOverwrites.find((o) => o.id === overwrite.id);
        if (existing) {
          this.overwrites.set(existing.id, existing);
          existingOverwrites.delete(existing.id);
        }

        this.overwrites["_add"](overwrite);
      }

      existingOverwrites.forEach((o) => (o.deleted = true));
    }

    return this;
  }
}

export interface ModifyGuildChannel extends Dictionary {
  name?: string;
  position?: number | null;
  permissionOverwrites?: (PermissionOverwrite | APIOverwrite)[] | null;
  parent?: CategoryChannel | string;
}
