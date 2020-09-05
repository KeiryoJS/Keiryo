/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Snowflake } from "@neocord/utils";
import { Base } from "../Base";

import type { ImageURLOptions } from "@neocord/rest";
import type { APIUser, UserFlags, UserPremiumType } from "discord-api-types/default";
import type { Client } from "../../lib";

export class User extends Base {
  /**
   * The ID of this user.
   */
  public readonly id: string;

  /**
   * The user's avatar hash.
   */
  public avatar!: string | null;

  /**
   * Whether the user belongs to an OAuth2 application.
   */
  public bot!: boolean;

  /**
   * The user's 4-digit discord-tag.
   */
  public discriminator!: string;

  /**
   * The user's email.
   */
  public email!: string | null;

  /**
   * The flags on this user's account.
   */
  public flags!: UserFlags;

  /**
   * The public flags on this user's account.
   */
  public publicFlags!: UserFlags;

  /**
   * The type of Nitro subscription on this user's account.
   */
  public premiumType!: UserPremiumType;

  /**
   * The user's chosen language option.
   */
  public locale!: string;

  /**
   * The user's username, not unique across the platform.
   */
  public username!: string;

  /**
   * Whether the user has two factor enabled on their account.
   */
  public mfaEnabled!: boolean;

  /**
   * Whether the email on this account has been verified.
   */
  public verified!: boolean;

  /**
   * Whether the user is an Official Discord System user (part of the urgent message system).
   */
  public system!: boolean;

  /**
   * Creates a new instance of User.
   * @param client The client.
   * @param data The decoded user data.
   */
  public constructor(client: Client, data: APIUser) {
    super(client);

    this.id = data.id;
    this._patch(data);
  }

  /**
   * The date when this user was created.
   */
  public get createdAt(): Date {
    return new Date(this.createdTimestamp);
  }

  /**
   * The timestamp when this user was created.
   */
  public get createdTimestamp(): number {
    return new Snowflake(this.id).timestamp;
  }


  /**
   * The tag of this user.
   */
  public get tag(): string {
    return `${this.username}#${this.discriminator}`;
  }

  /**
   * The mention string for this user.
   */
  public get mention(): string {
    return `<@!${this.id}>`;
  }

  /**
   * The default avatar url for this user.
   */
  public get defaultAvatarUrl(): string {
    return this.client.api.cdn.defaultAvatar((+this.discriminator) % 5);
  }

  /**
   * The URL for this user's avatar.
   * @param options The options for the url.
   */
  public avatarURL(options: ImageURLOptions = {}): string | null {
    if (!this.avatar) return null;
    return this.client.api.cdn.userAvatar(this.id, this.avatar, options);
  }

  /**
   * The display avatar url for this user.
   * @param options The options for the avatar.
   */
  public displayAvatarURL(options: ImageURLOptions = {}): string {
    return this.avatarURL(options) ?? this.defaultAvatarUrl;
  }

  /**
   * Get the string representation of this user.
   */
  public toString(): string {
    return this.mention;
  }

  /**
   * Updates this user with data from the api.
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