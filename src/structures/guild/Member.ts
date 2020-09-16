/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Base } from "../Base";

import type { APIGuildMember } from "discord-api-types/default";
import type { Guild } from "./Guild";
import type { User } from "../other/User";
import type { VoiceState } from "./VoiceState";

export class Member extends Base {
  /**
   * The ID of this member.
   */
  public readonly id: string;

  /**
   * The guild this member belongs to.
   */
  public readonly guild: Guild;

  /**
   * This users guild nickname.
   */
  public nickname!: string | null;

  /**
   * When the user joined the guild.
   */
  public joinedTimestamp!: number;

  /**
   * When the user started boosting the guild.
   */
  public boostedTimestamp!: number | null;

  /**
   * Whether the user is muted in voice channels
   */
  public deaf!: boolean;

  /**
   * Whether the user is deafened in voice channels
   */
  public mute!: boolean;

  /**
   * @param guild
   * @param data
   */
  public constructor(guild: Guild, data: APIGuildMember) {
    super(guild.client);

    this.id = data.user?.id as string;
    this.guild = guild;
  }

  /**
   * The user that this guild member represents.
   */
  public get user(): User {
    return this.client.users.get(this.id) as User;
  }

  /**
   * The displayed name for this guild member.
   */
  public get displayName(): string {
    return this.nickname ?? this.user.username;
  }

  /**
   * The voice state of this member.
   */
  public get voice(): VoiceState | null {
    return this.guild.voiceStates.get(this.id) ?? null;
  }

  /**
   * The mention string for this member.
   */
  public get mention(): string {
    return `<@${this.nickname ? "!" : ""}${this.id}>`;
  }

  /**
   * The string representation of this member.
   */
  public toString(): string {
    return this.mention;
  }

  /**
   * Updates this guild member from the discord gateway/api.
   * @protected
   */
  protected _patch(data: APIGuildMember): this {
    this.nickname = data.nick;
    this.joinedTimestamp = Date.parse(data.joined_at);
    this.deaf = data.deaf;
    this.mute = data.mute;
    this.boostedTimestamp = data.premium_since
      ? Date.parse(data.premium_since)
      : null;

    return this;
  }
}
