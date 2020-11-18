/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Extender } from "@neocord/utils";

import { User } from "./user/User";
import { ClientUser } from "./user/ClientUser";
import { Relationship } from "./user/Relationship";

import { Message } from "./message/Message";

import { Ban } from "./guild/member/Ban";
import { GuildMember } from "./guild/member/GuildMember";

import { Integration } from "./guild/Integration";
import { Guild } from "./guild/Guild";

import { WelcomeChannel } from "./guild/welcomeScreen/WelcomeChannel";
import { WelcomeScreen } from "./guild/welcomeScreen/WelcomeScreen";

import { TypingHelper } from "./channel/TypingHelper";
import { Invite } from "./channel/Invite";

const structures = {
  User,
  ClientUser,
  Relationship,

  Message,

  Ban,
  GuildMember,

  Integration,
  Guild,

  Invite,
  TypingHelper,

  WelcomeScreen,
  WelcomeChannel
};

export const resources = Extender.Immutable(structures);
