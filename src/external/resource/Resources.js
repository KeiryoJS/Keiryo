/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Extender } from "@neocord/utils";

import { User } from "./user/User";
import { ClientUser } from "./user/ClientUser";
import { Relationship } from "./user/Relationship";

import { Member } from "./member/Member";

import { Message } from "./message/Message";
import { WelcomeChannel } from "./guild/welcomeScreen/WelcomeChannel";
import { WelcomeScreen } from "./guild/welcomeScreen/WelcomeScreen";

const structures = {
  User,
  ClientUser,
  Relationship,
  Message,
  Member,
  WelcomeScreen,
  WelcomeChannel
};

export const resources = Extender.Immutable(structures);
