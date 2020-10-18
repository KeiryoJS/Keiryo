/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource, ResourceLike, ResourceType } from "../../../abstract";
import { UncachedResourceError } from "../../../../utils";

import type { GatewayVoiceState } from "discord-api-types";
import type { Client } from "../../../../client";
import type { VoiceChannel } from "../../channel/guild/VoiceChannel";
import type { GuildMember } from "./GuildMember";
import type { Guild } from "../Guild";

export class VoiceState extends Resource {
  /**
   * ID of the member this voice state is for.
   *
   * @type {string}
   */
  public readonly id: string;

  /**
   * ID of the channel the user is in.
   *
   * @type {string | null}
   */
  public channelId!: string | null;

  /**
   * The voice state's session id.
   *
   * @type {string}
   */
  public sessionId!: string;

  /**
   * Whether this user is deafened by the server.
   *
   * @type {boolean}
   */
  public serverDeafened!: boolean;

  /**
   * Whether this user is muted by the server.
   *
   * @type {boolean}
   */
  public serverMuted!: boolean;

  /**
   * Whether this user is locally deafened.
   *
   * @type {boolean}
   */
  public selfDeafened!: boolean;

  /**
   * Whether this user is locally muted.
   *
   * @type {boolean}
   */
  public selfMuted!: boolean;

  /**
   * Whether this user is streaming using "Go Live"
   *
   * @type {boolean}
   */
  public selfStream!: boolean;

  /**
   * Whether this user's camera is enabled.
   *
   * @type {boolean}
   */
  public selfVideo!: boolean;

  /**
   * Whether this user is muted by the current user.
   *
   * @type {boolean}
   */
  public suppressed!: boolean;

  /**
   * The guild that this voice state belongs to.
   *
   * @type {Guild}
   * @private
   */
  readonly #guild: Guild;

  /**
   * @param {Client} client The client instance.
   * @param {GatewayVoiceState} data The voice state data.
   * @param {Guild} guild The guild.
   */
  public constructor(client: Client, data: GatewayVoiceState, guild: Guild) {
    super(client);

    this.id = data.user_id;
    this.#guild = guild;
  }

  /**
   * The channel that the user is in.
   * @type {VoiceChannel | null}
   */
  public get channel(): VoiceChannel | null {
    return this.channelId
      ? this.#guild.channels.get<VoiceChannel>(this.channelId) ?? null
      : null;
  }

  /**
   * The member this voice state belongs to.
   * @type {Member}
   */
  public get member(): GuildMember {
    const member = this.#guild.members.cache.get(this.id);
    if (!member) {
      throw new UncachedResourceError(ResourceType.GuildMember);
    }

    return member;
  }

  /**
   * Whether this member is server-deafened or self-deafened.
   *
   * @type {boolean}
   */
  public get deaf(): boolean {
    return this.serverDeafened || this.selfDeafened;
  }

  /**
   * Whether this member is server-muted or self-muted.
   *
   * @type {boolean}
   */
  public get mute(): boolean {
    return this.serverMuted || this.selfMuted;
  }

  /**
   * (Un)mute the member of this voice state.
   * @param {boolean} [mute=true] Whether or not to mute the member.
   * @param {string} [reason] Reason for (un)muting this member.
   *
   * @returns {Promise<GuildMember>}
   */
  public setMute(mute = true, reason?: string): Promise<GuildMember> {
    return this.member.edit({ mute }, reason);
  }

  /**
   * (Un)deafen the member of this voice state.
   * @param {boolean} [deaf=true] Whether or not to deafen this member.
   * @param {string} [reason] The reason for (un)deafening this member.
   *
   * @returns {Promise<GuildMember>}
   */
  public setDeaf(deaf = true, reason?: string): Promise<GuildMember> {
    return this.member.edit({ deaf }, reason);
  }

  /**
   * Moves the member of this voice state to a different channel, or disconnects them from their current channel.
   * @param {ResourceLike<VoiceChannel> | null} channel The voice channel to move the member to, or `null` to disconnect them.
   * @param {string} [reason] The reason for moving or disconnecting the member.
   *
   * @returns {Promise<GuildMember>}
   */
  public setChannel(
    channel: ResourceLike<VoiceChannel> | null,
    reason?: string
  ): Promise<GuildMember> {
    return this.member.edit({ channel }, reason);
  }

  /**
   * Kicks the member from the channel they are currently in.
   * @param {string} [reason] The reason for disconnecting the member.
   * @returns {Promise<GuildMember>}
   */
  public kick(reason?: string): Promise<GuildMember> {
    return this.setChannel(null, reason);
  }

  /**
   * Updates this voice state with data from the discord gateway/api.
   * @type {GatewayVoiceState} data
   *
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