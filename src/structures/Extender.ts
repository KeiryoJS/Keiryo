/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Extender } from "@neocord/utils";

import { WelcomeChannel } from "./guild/welcome/WelcomeChannel";
import { WelcomeScreen } from "./guild/welcome/WelcomeScreen";
import { Guild } from "./guild/Guild";
import { Invite } from "./other/Invite";
import { Member } from "./guild/Member";
import { PermissionOverwrite } from "./guild/PermissionOverwrite";
import { Role } from "./guild/Role";
import { VoiceState } from "./guild/VoiceState";
import { Message } from "./message/Message";
import { User } from "./other/User";
import { GuildChannel } from "./channel/guild/GuildChannel";
import { TextChannel } from "./channel/guild/TextChannel";
import { DMChannel } from "./channel/DMChannel";
import { CategoryChannel } from "./channel/guild/CategoryChannel";
import { VoiceChannel } from "./channel/guild/VoiceChannel";
import { NewsChannel } from "./channel/guild/NewsChannel";
import { StoreChannel } from "./channel/guild/StoreChannel";

const structures = {
  WelcomeChannel,
  WelcomeScreen,
  Guild,
  Invite,
  Member,
  PermissionOverwrite,
  Role,
  VoiceState,
  Message,
  User,

  CategoryChannel,
  GuildChannel: GuildChannel as any,
  NewsChannel,
  StoreChannel,
  VoiceChannel,
  TextChannel,
  DMChannel,
};

export const neo = Extender.Immutable(structures);
export type Structures = typeof structures;
