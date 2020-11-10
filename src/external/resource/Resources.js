/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { User } from "./user/User";
import { ClientUser } from "./user/ClientUser";
import { Relationship } from "./user/Relationship";
import { Extender } from "@neocord/utils";

const structures = {
  User,
  ClientUser,
  Relationship
};

export const resources = Extender.Immutable(structures);
