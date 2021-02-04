/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { homepage, version } from "../../package.json";

export const IMAGE_SIZES = Array.from({ length: 9 }, (_e, i) => 2 ** (i + 4));

export const IMAGE_FORMATS = [ "jpg", "jpeg", "png", "webp", "gif" ];

export const USER_AGENT = `DiscordBot (${homepage.split("#")[0]}, ${version}) Node.js/${process.version}`;

export const API_URL = "https://discord.com/api";

export const CDN_URL = "https://cdn.discordapp.com";

export enum RESTEvent {
  RATE_LIMITED = "rateLimited",
  DEBUG = "debug"
}
