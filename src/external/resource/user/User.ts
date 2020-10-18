/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */


import { Resource } from "../../abstract/Resource";

import type { ImageURLOptions } from "@neocord/rest";
import type { APIUser, UserFlags, UserPremiumType } from "discord-api-types";
import type { Client } from "../../../client";
import type { DMChannel } from "../channel/DMChannel";

export class User extends Resource {
  /**
   * This user's id.
   *
   * @type {string}
   */
  public readonly id: string;

  /**
   * The user's avatar hash.
   *
   * @type {string | null}
   */
  public avatar!: string | null;

  /**
   * Whether the user belongs to an OAuth2 application.
   *
   * @type {boolean}
   */
  public bot!: boolean;

  /**
   * The user's 4-digit discord-tag.
   *
   * @type {string}
   */
  public discriminator!: string;

  /**
   * The user's email.
   *
   * @type {string | null}
   */
  public email!: string | null;

  /**
   * The flags on this user's account.
   *
   * @type {UserFlags}
   */
  public flags!: UserFlags;

  /**
   * The public flags on this user's account.
   *
   * @type {UserFlags}
   */
  public publicFlags!: UserFlags;

  /**
   * The type of Nitro subscription on this user's account.
   *
   * @type {UserPremiumType}
   */
  public premiumType!: UserPremiumType;

  /**
   * The user's chosen language option.
   *
   * @type {string}
   */
  public locale!: string;

  /**
   * The user's username, not unique across the platform.
   *
   * @type {string}
   */
  public username!: string;

  /**
   * Whether the user has two factor enabled on their account.
   *
   * @type {boolean}
   */
  public mfaEnabled!: boolean;

  /**
   * Whether the email on this account has been verified.
   *
   * @type {boolean}
   */
  public verified!: boolean;

  /**
   * Whether the user is an Official Discord System user (part of the urgent message system).
   *
   * @type {boolean}
   */
  public system!: boolean;

  /**
   * @param {Client} client The client.
   * @param {APIUser} data The decoded user data.
   */
  public constructor(client: Client, data: APIUser) {
    super(client);

    this.id = data.id;
    this._patch(data);
  }

  /**
   * The tag of this user.
   *
   * @type {string}
   */
  public get tag(): string {
    return `${this.username}#${this.discriminator}`;
  }

  /**
   * The mention string for this user.
   *
   * @type {string}
   */
  public get mention(): string {
    return `<@!${this.id}>`;
  }

  /**
   * The default avatar url for this user.
   *
   * @type {string}
   */
  public get defaultAvatarUrl(): string {
    return this.client.rest.cdn.defaultAvatar(+this.discriminator % 5);
  }

  /**
   * The URL for this user's avatar.
   * @param {ImageURLOptions} [options] The options for the url.
   *
   * @returns {string | null}
   */
  public avatarURL(options: ImageURLOptions = {}): string | null {
    if (!this.avatar) return null;
    return this.client.rest.cdn.userAvatar(this.id, this.avatar, options);
  }

  /**
   * Gets an existing DM channel or creates one.
   *
   * @returns {DMChannel}
   */
  public async dm(): Promise<DMChannel> {
    let dm = this.client.dms.cache.get(this.id);
    if (!dm) {
      dm = await this.client.dms.create(this);
    }

    return dm;
  }

  /**
   * The display avatar url for this user.
   * @param {ImageURLOptions} [options] The options for the avatar.
   * @returns {string}
   */
  public displayAvatarURL(options: ImageURLOptions = {}): string {
    return this.avatarURL(options) ?? this.defaultAvatarUrl;
  }

  /**
   * Get the string representation of this user.
   *
   * @returns {string}
   */
  public toString(): string {
    return this.mention;
  }

  /**
   * Updates this user with data from the api.
   * @param {APIUser} data
   *
   * @protected
   */
  protected _patch(data: APIUser): this {
    this.username = data.username;
    this.discriminator = data.discriminator;
    this.avatar = data.avatar;
    this.bot = data.bot ?? false;
    this.email = data.email ?? null;
    this.flags = data.flags ?? 0;
    this.premiumType = data.premium_type ?? 0;
    this.locale = data.locale ?? "en-US";
    this.mfaEnabled = data.mfa_enabled ?? false;
    this.verified = data.verified ?? false;
    this.system = data.system ?? false;

    return this;
  }
}
