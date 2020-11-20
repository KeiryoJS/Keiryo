/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { BitField, BitFieldObject } from "./BitField";

export enum Intent {
  GUILDS = 1 << 0,
  GUILD_MEMBERS = 1 << 1,
  GUILD_BANS = 1 << 2,
  GUILD_EMOJIS = 1 << 3,
  GUILD_INTEGRATIONS = 1 << 4,
  GUILD_WEBHOOKS = 1 << 5,
  GUILD_INVITES = 1 << 6,
  GUILD_VOICE_STATES = 1 << 7,
  GUILD_PRESENCES = 1 << 8,
  GUILD_MESSAGES = 1 << 9,
  GUILD_MESSAGE_REACTIONS = 1 << 10,
  GUILD_MESSAGE_TYPING = 1 << 11,
  DIRECT_MESSAGES = 1 << 12,
  DIRECT_MESSAGE_REACTIONS = 1 << 13,
  DIRECT_MESSAGE_TYPING = 1 << 14,
}

export class Intents extends BitField<IntentResolvable> {
  /**
   * All intents that were provided by discord.
   *
   * @type {Intent}
   */
  public static FLAGS = Intent;

  /**
   * All privileged intents ORed together.
   *
   * @type {number}
   */
  public static PRIVILEGED = Intent.GUILD_MEMBERS | Intent.GUILD_PRESENCES;

  /**
   * All of the non-privileged intents.
   *
   * @type {number}
   */
  public static NON_PRIVILEGED = Intents.ALL & ~Intents.PRIVILEGED;

  /**
   * Intents recommended by NeoCord.
   *
   * @type {number}
   */
  public static DEFAULT =
    Intent.GUILDS |
    Intent.GUILD_MESSAGES |
    Intent.GUILD_BANS |
    Intent.GUILD_EMOJIS |
    Intent.GUILD_INVITES |
    Intent.GUILD_VOICE_STATES |
    Intent.DIRECT_MESSAGES;
}

type IntentBit = Intent | keyof typeof Intent | number | BitFieldObject;
export type IntentResolvable = IntentBit | IntentBit[];
