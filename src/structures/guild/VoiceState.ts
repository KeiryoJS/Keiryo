/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Base } from "../Base";

import type { GatewayVoiceState } from "discord-api-types";
import type { Client } from "../../internal";
import type { Guild } from "./Guild";
import type { VoiceChannel } from "../channel/guild/VoiceChannel";
import type { Member } from "./Member";
import type { BaseResolvable } from "../../managers";

export class VoiceState extends Base {
  /**
   * The ID of the user the voice state is for.
   * @type {string}
   */
  public readonly id: string;

  /**
   * The guild this voice state is apart of.
   * @type {Guild}
   */
  public readonly guild: Guild;

  /**
   * ID of the channel the user is in.
   * @type {string | null}
   */
  public channelId!: string | null;

  /**
   * The voice state's session id.
   * @type {string}
   */
  public sessionId!: string;

  /**
   * Whether this user is deafened by the server.
   * @type {boolean}
   */
  public serverDeafened!: boolean;

  /**
   * Whether this user is muted by the server.
   * @type {boolean}
   */
  public serverMuted!: boolean;

  /**
   * Whether this user is locally deafened.
   * @type {boolean}
   */
  public selfDeafened!: boolean;

  /**
   * Whether this user is locally muted.
   * @type {boolean}
   */
  public selfMuted!: boolean;

  /**
   * Whether this user is streaming using "Go Live"
   * @type {boolean}
   */
  public selfStream!: boolean;

  /**
   * Whether this user's camera is enabled.
   * @type {boolean}
   */
  public selfVideo!: boolean;

  /**
   * Whether this user is muted by the current user.
   * @type {boolean}
   */
  public suppressed!: boolean;

  /**
   * Creates a new instanceof VoiceState.
   * @param {Client} client The client instance.
   * @param {GatewayVoiceState} data The voice state data.
   * @param {Guild} guild The guild.
   */
  public constructor(client: Client, data: GatewayVoiceState, guild: Guild) {
    super(client);

    this.id = data.user_id;
    this.guild = guild;
    this._patch(data);
  }

  /**
   * The channel that the user is in.
   * @type {VoiceChannel | null}
   */
  public get channel(): VoiceChannel | null {
    return this.channelId
      ? this.guild.channels.get<VoiceChannel>(this.channelId) ?? null
      : null;
  }

  /**
   * The member this voice state belongs to.
   * @type {Member}
   */
  public get member(): Member {
    return this.guild.members.get(this.id) as Member;
  }

  /**
   * Whether this member is server-deafened or self-deafened.
   * @type {boolean}
   */
  public get deaf(): boolean {
    return this.serverDeafened || this.selfDeafened;
  }

  /**
   * Whether this member is server-muted or self-muted.
   * @type {boolean}
   */
  public get mute(): boolean {
    return this.serverMuted || this.selfMuted;
  }

  /**
   * (Un)mute the member of this voice state.
   * @param {boolean} [mute=true] Whether or not to mute the member.
   * @param {string} [reason] Reason for (un)muting this member.
   * @returns {Promise<Member>}
   */
  public setMute(mute = true, reason?: string): Promise<Member> {
    return this.member.edit({ mute }, reason);
  }

  /**
   * (Un)deafen the member of this voice state.
   * @param {boolean} [deaf=true] Whether or not to deafen this member.
   * @param {string} [reason] The reason for (un)deafening this member.
   * @returns {Promise<Member>}
   */
  public setDeaf(deaf = true, reason?: string): Promise<Member> {
    return this.member.edit({ deaf }, reason);
  }

  /**
   * Moves the member of this voice state to a different channel, or disconnects them from their current channel.
   * @param {BaseResolvable<VoiceChannel> | null} channel The voice channel to move the member to, or `null` to disconnect them.
   * @param {string} [reason] The reason for moving or disconnecting the member.
   * @returns {Promise<Member>}
   */
  public setChannel(
    channel: BaseResolvable<VoiceChannel> | null,
    reason?: string
  ): Promise<Member> {
    return this.member.edit({ channel }, reason);
  }

  /**
   * Kicks the member from the channel they are currently in.
   * @param {string} [reason] The reason for disconnecting the member.
   * @returns {Promise<Member>}
   */
  public kick(reason?: string): Promise<Member> {
    return this.setChannel(null, reason);
  }

  /**
   * Updates this voice state with data from the discord gateway/api.
   * @protected
   */
  protected _patch(data: GatewayVoiceState): this {
    this.channelId = data.channel_id ?? null;

    this.sessionId = data.session_id;

    this.serverDeafened = data.deaf;

    this.serverMuted = data.mute;

    this.selfDeafened = data.self_deaf;

    this.selfMuted = data.self_mute;

    this.selfStream = data.self_stream ?? false;

    this.selfVideo = data.self_video;

    this.suppressed = data.suppress;

    return this;
  }
}
