/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Extender } from "@neocord/utils";
import { Guild } from "./guild/Guild";
import { Message } from "./message/Message";
import { User } from "./other/User";

export const neo = new Extender({
  Guild,
  Message,
  User,
});
