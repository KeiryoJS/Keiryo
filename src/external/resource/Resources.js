/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Extender } from "@neocord/utils";

/* Channel */
import { GuildChannel } from "./channel/guild/GuildChannel";
import { Invite } from "./channel/Invite";
import { TypingHelper } from "./channel/TypingHelper";

/* Guild Member */
import { Ban } from "./guild/member/Ban";
import { Role } from "./guild/member/Role";
import { Presence } from "./guild/member/Presence";
import { GuildMember } from "./guild/member/GuildMember";
import { VoiceState } from "./guild/member/VoiceState";

/* Welcome Screen */
import { WelcomeScreen } from "./guild/welcomeScreen/WelcomeScreen";
import { WelcomeChannel } from "./guild/welcomeScreen/WelcomeChannel";

/* Guild */
import { Guild } from "./guild/Guild";
import { Template } from "./guild/Template";
import { Integration } from "./guild/Integration";
import { GuildWidget } from "./guild/GuildWidget";

/* Message */
import { Message } from "./message/Message";

/* Misc */
import { Typing } from "./misc/Typing";
import { VoiceRegion } from "./misc/VoiceRegion";

/* User */
import { User } from "./user/User";
import { ClientUser } from "./user/ClientUser";
import { Relationship } from "./user/Relationship";
import { ClientPresence } from "./user/ClientPresence";

const structures = {
  /* Channel */
  GuildChannel,
  Invite,
  TypingHelper,

  /* Guild Member */
  Ban,
  Role,
  Presence,
  VoiceState,
  GuildMember,

  /* Welcome Screen */
  WelcomeScreen,
  WelcomeChannel,

  /* Guild */
  Guild,
  Template,
  Integration,
  GuildWidget,

  /* Message */
  Message,

  /* Misc */
  Typing,
  VoiceRegion,

  /* User */
  User,
  ClientUser,
  Relationship,
  ClientPresence,
};

export const resources = Extender.Immutable(structures);
