/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { BitField, BitFieldObject } from "./BitField";

export enum ActivityFlag {
  INSTANCE = 1 << 0,
  JOIN = 1 << 1,
  SPECTATE = 1 << 2,
  JOIN_REQUEST = 1 << 3,
  SYNC = 1 << 4,
  PLAY = 1 << 5,
}

export class ActivityFlags extends BitField<ActivityFlagResolvable> {
  /**
   * The activity flags.
   * @type {ActivityFlag}
   */
  public static FLAGS = ActivityFlag;
}

type ActivityFlagBit = ActivityFlag | keyof typeof ActivityFlag | number | BitFieldObject;
export type ActivityFlagResolvable = ActivityFlagBit | ActivityFlagBit[];
