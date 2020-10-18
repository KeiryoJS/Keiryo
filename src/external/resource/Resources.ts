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
import { Relationship } from "./user/Relationship";

import { DMChannel } from "./channel/DMChannel";
import { PermissionOverwrite } from "./channel/Overwrite";
import { GuildChannel } from "./channel/guild/GuildChannel";
import { CategoryChannel } from "./channel/guild/CategoryChannel";
import { TypingManager } from "./channel/TypingManager";
import { VoiceChannel } from "./channel/guild/VoiceChannel";
import { TextChannel } from "./channel/guild/TextChannel";
import { StoreChannel } from "./channel/guild/StoreChannel";
import { NewsChannel } from "./channel/guild/NewsChannel";
import { WelcomeScreen } from "./guild/welcomeScreen/WelcomeScreen";
import { WelcomeChannel } from "./guild/welcomeScreen/WelcomeChannel";
import { Message } from "./message/Message";
import { Integration } from "./guild/Integration";
import { Channel } from "./channel/Channel";

const structures = {
  User,
  Relationship,

  GuildMember,
  VoiceState,
  Presence,
  Guild,
  Role,
  Ban,
  WelcomeChannel,
  WelcomeScreen,
  Integration,

  Message,
  Channel,
  TextChannel,
  VoiceChannel,
  DMChannel,
  CategoryChannel,
  GuildChannel,
  StoreChannel,
  NewsChannel,
  TypingManager,
  PermissionOverwrite
};

// @ts-expect-error
export const resources = Extender.Immutable<Structures>(structures);

export type Structures = typeof structures;
