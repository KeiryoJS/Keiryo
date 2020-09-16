/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Base } from "../Base";
import { Permissions } from "../../util";

import type { APIRole, APIRoleTags } from "discord-api-types/default";
import type { Guild } from "./Guild";

export class Role extends Base {
  /**
   * The ID of this role.
   */
  public readonly id: string;

  /**
   * The guild this role belongs to.
   */
  public readonly guild: Guild;

  /**
   * The color that this role has.
   */
  public color!: number;

  /**
   * If this role is pinned in the user listing
   */
  public hoisted!: boolean;

  /**
   * Whether this role is managed by an integration
   */
  public managed!: boolean;

  /**
   * Whether this role is mentionable
   */
  public mentionable!: boolean;

  /**
   * The name of this role.
   */
  public name!: string;

  /**
   * The permissions of this role.
   */
  public permissions!: Permissions;

  /**
   * The position of this role
   */
  public position!: number;

  /**
   * Tags for this role.
   */
  public tags!: APIRoleTags | null;

  /**
   * Creates a new instanceof Role.
   * @param guild The guild that this role belongs to.
   * @param data
   */
  public constructor(guild: Guild, data: APIRole) {
    super(guild.client);

    this.id = data.id;
    this.guild = guild;
  }

  /**
   * Whether or not this role is @everyone
   */
  public get everyone(): boolean {
    return this.id === this.guild.id;
  }

  /**
   * The mention string of this role.
   */
  public get mention(): string {
    return this.everyone ? "@everyone" : `<@&${this.id}>`;
  }

  /**
   * The string representation of this role.
   */
  public toString(): string {
    return this.mention;
  }

  /**
   * Updates this role with data from the api.
   * @protected
   */
  protected _patch(data: APIRole): this {
    this.color = data.color;
    this.hoisted = data.hoist;
    this.managed = data.managed;
    this.mentionable = data.mentionable;
    this.name = data.name;
    this.position = data.position;
    this.tags = data.tags ?? null;
    this.permissions = new Permissions(data.permissions).freeze();

    return this;
  }
}
