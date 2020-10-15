/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { User } from "./user/User";
import { Extender } from "@neocord/utils";

import { GuildMember } from "./guild/member/GuildMember";
import { VoiceState } from "./guild/member/VoiceState";
import { Presence } from "./guild/member/Presence";
import { Ban } from "./guild/member/Ban";
import { Role } from "./guild/member/Role";
import { Guild } from "./guild/Guild";

const structures = {
  User,

  GuildMember,
  VoiceState,
  Presence,
  Guild,
  Role,
  Ban,
}

export const resources = Extender.Immutable<Structures>(structures);

export type Structures = typeof structures;
