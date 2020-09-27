/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import type { Client } from "../../internal";
import type { APIGuildMember } from "discord-api-types/v6/payloads";
import type { Guild } from "../guild/Guild";
import type { Member } from "../guild/Member";

export class Typing {
  /**
   * The client instance.
   * @type {Client}
   */
  public readonly client: Client;

  /**
   * The channel that the user is typing in.
   * @type {string}
   */
  public readonly channelId: string;

  /**
   * The guild that the user is typing in.
   * @type {string}
   */
  public readonly guildId?: string;

  /**
   * The user that is typing.
   * @type {string}
   */
  public readonly userId: string;

  /**
   * When the user started typing.
   * @type {number}
   */
  public readonly startedTimestamp: number;

  /**
   * @param {Client} client The client instance.
   * @param {TypingStartData} data The typing data.
   */
  public constructor(client: Client, data: TypingStartData) {
    this.client = client;
    this.channelId = data.channel_id;
    this.guildId = data.guild_id;
    this.userId = data.user_id;
    this.startedTimestamp = data.timestamp;
  }

  /**
   * The guild that the user is typing in.
   * @type {?Guild}
   */
  public get guild(): Guild | null {
    return (this.guildId ? this.client.guilds.get(this.guildId) : null) ?? null;
  }

  /**
   * The member that is typing.
   * @type {?Member}
   */
  public get member(): Member | null {
    return (this.guild ? this.guild.members.get(this.userId) : null) ?? null;
  }
}

interface TypingStartData {
  channel_id: string;
  guild_id?: string;
  user_id: string;
  timestamp: number;
  member?: APIGuildMember;
}
