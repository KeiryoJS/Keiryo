/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Channel } from "./Channel";
import { ChannelType } from "discord-api-types";

export class DMChannel extends Channel {
  public type = ChannelType.DM;
}
