import { APIChannel, ChannelType } from "discord-api-types";
import { Collection, Permission } from "@neocord/utils";
import { EditGuildChannel, GuildChannel } from "./GuildChannel";
import { exclude } from "../../../../utils";

import type { GuildMember } from "../../guild/member/GuildMember";
import type { MemberLike } from "../../../pool/guild/GuildMemberPool";

export class VoiceChannel extends GuildChannel {
  public readonly type = ChannelType.GUILD_VOICE;

  /**
   * The bitrate (in bits) of the voice channel; 8000 to 96000 (128000 for VIP servers).
   *
   * @type {number}
   */
  public bitrate!: number;

  /**
   * The user limit of the voice channel; 0 refers to no limit, 1 to 99 refers to a user limit.
   *
   * @type {number}
   */
  public userLimit!: number;

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
   *
   * @type {boolean}
   */
  public get manageable(): boolean {
    return super.manageable && this.speakable;
  }

  /**
   * The members that are in this voice channel.
   *
   * @type {Collection<string, GuildMember>}
   */
  public get members(): Collection<string, GuildMember> {
    const col = new Collection<string, GuildMember>();
    for (const [ , member ] of this.guild.members.cache) {
      if (member.voice?.channelId === this.id) {
        col.set(member.id, member);
      }
    }

    return col;
  }

  /**
   * Whether this voice channel has reached the max amount of connected members.
   *
   * @type {boolean}
   */
  public get full(): boolean {
    return this.userLimit > 0 && this.members.size >= this.userLimit;
  }


  /**
   * Disconnects a member from this voice channel.
   * @param {MemberLike} member The member to disconnect.
   * @param {string} [reason] Reason for disconnecting this member.
   *
   * @returns {Promise<GuildMember>} The disconnected member.
   */
  public kick(member: MemberLike, reason?: string): Promise<GuildMember> {
    const id = this.guild.members.resolveId(member);
    if (!id || !this.members.has(id)) {
      throw new Error(`VoiceChannel#kick: no member with ${id} is in this voice channel.`);
    }

    return this.members.get(id)
      ?.voice
      ?.kick(reason) as Promise<GuildMember>;
  }

  /**
   * Edits this voice channel.
   * @param {EditVoiceChannel} data The new properties for the voice channel.
   *
   * @returns {Promise<VoiceChannel>}
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
      user_limit: data.userLimit
    });
  }

  /**
   * Updates this voice channel with data from discord.
   * @param {APIChannel} data
   *
   * @protected
   */
  protected _patch(data: APIChannel): this {
    if (data.bitrate) {
      this.bitrate = data.bitrate;
    }

    if (data.user_limit) {
      this.userLimit = data.user_limit;
    }

    return super._patch(data);
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

