/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { BitField, BitFieldObject } from "./BitField";

export enum UserFlag {
  DISCORD_EMPLOYEE = 1 << 0,
  PARTNERED_SERVER_OWNER = 1 << 1,
  HYPESQUAD_EVENTS = 1 << 2,
  BUG_HUNTER_LEVEL_ONE = 1 << 3,
  HOUSE_BRAVERY = 1 << 6,
  HOUSE_BRILLIANCE = 1 << 7,
  HOUSE_BALANCE = 1 << 8,
  EARLY_SUPPORTED = 1 << 9,
  TEAM_USER = 1 << 10,
  BUG_HUNTER_LEVEL_TWO = 1 << 14,
  VERIFIED_BOT = 1 << 16,
  EARLY_VERIFIED_BOT_DEVELOPER = 1 << 17,
}

export class UserFlags extends BitField<UserFlagResolvable> {
  /**
   * The user flags.
   * @type {UserFlag}
   */
  public static FLAGS = UserFlag;
}

type UserFlagBit = UserFlag | keyof typeof UserFlag | number | BitFieldObject;
export type UserFlagResolvable = UserFlagBit | UserFlagBit[];
