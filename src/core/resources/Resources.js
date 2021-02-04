/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Extender } from "../../common";

// resources
import { VoiceRegion } from "./misc/VoiceRegion";
import { Typing } from "./misc/Typing";

import { User } from "./user/User";

const resources = Extender.Immutable({
  VoiceRegion,
  Typing,

  User
});

export default resources
