/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

/**
 * Activity types.
 * @typedef {Object} ActivityType.
 * @prop {number} GAME Example: "Playing Rocket League", Format: Playing {name}
 * @prop {number} STREAMING Example: "Streaming Rocket League", Format: Streaming {details}
 * @prop {number} LISTENING Example: "Listening to Spotify", Format: Listening to {name}
 * @prop {number} CUSTOM Example: ":smiley: I am cool", Format: {emoji} {name}
 * @prop {number} COMPETING Example: "Competing in Arena World Champions", Competing in {name}
 */
export enum ActivityType {
  GAME,
  STREAMING,
  LISTENING,
  WATCHING,
  CUSTOM,
  COMPETING,
}