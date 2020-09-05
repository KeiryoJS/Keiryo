/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { BitField, BitFieldObject } from "@neocord/utils";

export enum Cacheable {
  Guild = 1 << 0,
  Message = 1 << 1,
  Role = 1 << 2,
  Member = 1 << 3,
  Overwrite = 1 << 4,
  VoiceState = 1 << 5,
  Presence = 1 << 6,
  DMChannel = 1 << 7,
  GuildChannel = 1 << 8,
  GuildEmoji = 1 << 9,
  User = 1 << 10,
  Invite = 1 << 11,
  PinnedMessage = 1 << 12
}

export class Cacheables extends BitField<CacheableResolvable> {
  /**
   * All cacheable structures.
   */
  public static FLAGS = Cacheable;
}

export type CacheableResolvable = Cacheable
  | keyof Cacheable
  | number
  | BitFieldObject
  | ((keyof Cacheable) | number | BitFieldObject)[];