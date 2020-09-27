/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { EditGuildChannel, GuildChannel } from "./GuildChannel";
import { Collection } from "@neocord/utils";
import { ChannelType } from "discord-api-types";
import { DiscordStructure, exclude, Permission } from "../../../util";

import type { Member } from "../../guild/Member";
import type { MemberResolvable } from "../../../managers";

export class VoiceChannel extends GuildChannel {
  public readonly structureType = DiscordStructure.GuildChannel;

  /**
   * The type of this channel.
   * @type {ChannelType.GUILD_VOICE}
   */
  public readonly type = ChannelType.GUILD_VOICE;

  /**
   * The bitrate (in bits) of the voice channel; 8000 to 96000 (128000 for VIP servers).
   * @type {number}
   */
  public bitrate!: number;

  /**
   * The user limit of the voice channel; 0 refers to no limit, 1 to 99 refers to a user limit.
   * @type {number}
   */
  public userLimit!: number;

  /**
   * Whether the current user can delete this voice channel.
   * @type {boolean}
   */
  public get deletable(): boolean {
    return !this.deleted;
  }

  /**
   * Whether the current user can join this channel.
   * @type {boolean}
   */
  public get joinable(): boolean {
    return (
      this.viewable && this.guild.me.permissionsIn(this).has(Permission.Connect)
    );
  }

  /**
   * Whether the current user can speak in this channel.
   * @type {boolean}
   */
  public get speakable(): boolean {
    return (
      this.viewable &&
      this.joinable &&
      this.guild.me.permissionsIn(this).has(Permission.Connect)
    );
  }

  /**
   * Whether the current user can manage this voice channel.
   * @type {boolean}
   */
  public get manageable(): boolean {
    return super.manageable && this.speakable;
  }

  /**
   * The members that are in this voice channel.
   * @type {Collection<string, Member>}
   */
  public get members(): Collection<string, Member> {
    const col = new Collection<string, Member>();
    for (const [, member] of this.guild.members) {
      if (member.voice?.channelId === this.id) col.set(member.id, member);
    }

    return col;
  }

  /**
   * Whether this voice channel has reached the max amount of connected members.
   * @type {boolean}
   */
  public get full(): boolean {
    return this.userLimit > 0 && this.members.size >= this.userLimit;
  }

  /**
   * Disconnects a member from this voice channel.
   * @param {MemberResolvable} member The member to disconnect.
   * @param {string} [reason] Reason for disconnecting this member.
   * @returns {Promise<Member>} The disconnected member.
   */
  public kick(member: MemberResolvable, reason?: string): Promise<Member> {
    const id = this.guild.members.resolveId(member);
    if (!id || !this.members.has(id)) {
      throw new Error(
        `VoiceChannel#kick: no member with ${id} is in this voice channel.`
      );
    }

    return this.members.get(id)?.voice?.kick(reason) as Promise<Member>;
  }

  /**
   * Edits this voice channel.
   * @param {EditVoiceChannel} data The new properties for the voice channel.
   */
  public edit(data: EditVoiceChannel): Promise<this> {
    if (data.userLimit) {
      data.userLimit = Math.abs(data.userLimit);
      if (!(data.userLimit >= 0 && data.userLimit <= 99)) {
        throw new RangeError("VoiceChannel#edit: value must be 0-99.");
      }
    }

    return super.edit({
      ...exclude(data, "userLimit"),
      user_limit: data.userLimit,
    });
  }
}

export interface EditVoiceChannel extends EditGuildChannel {
  /**
   * The bitrate (in bits) of the voice channel; 8000 to 96000 (128000 for VIP servers)
   * @type {number}
   */
  bitrate?: number;

  /**
   * The user limit of the voice channel; 0 refers to no limit, 1 to 99 refers to a user limit
   * @type {number}
   */
  userLimit?: number;
}
