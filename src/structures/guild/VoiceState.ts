/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Base } from "../Base";
import { DiscordStructure } from "../../util";

import type { GatewayVoiceState } from "discord-api-types";
import type { Client } from "../../internal";
import type { Guild } from "./Guild";
import type { VoiceChannel } from "../channel/guild/VoiceChannel";
import type { Member } from "./Member";

export class VoiceState extends Base {
  public readonly structureType = DiscordStructure.VoiceState;

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
  public deafened!: boolean;

  /**
   * Whether this user is muted by the server.
   * @type {boolean}
   */
  public muted!: boolean;

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
   * Updates this voice state with data from the discord gateway/api.
   * @protected
   */
  protected _patch(data: GatewayVoiceState): this {
    this.channelId = data.channel_id ?? null;
    this.sessionId = data.session_id;
    this.deafened = data.deaf;
    this.muted = data.mute;
    this.selfDeafened = data.self_deaf;
    this.selfMuted = data.self_mute;
    this.selfStream = data.self_stream ?? false;
    this.selfVideo = data.self_video;
    this.suppressed = data.suppress;

    return this;
  }
}
