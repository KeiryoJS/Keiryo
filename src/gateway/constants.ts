/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

export enum GatewayOp {
  DISPATCH = 0,
  HEARTBEAT = 1,
  IDENTIFY = 2,
  PRESENCE_UPDATE = 3,
  VOICE_STATE_UPDATE = 4,
  RESUME = 6,
  RECONNECT = 7,
  REQUEST_GUILD_MEMBERS = 8,
  INVALID_SESSION = 9,
  HELLO = 10,
  HEARTBEAT_ACK = 11
}

export enum GatewayCloseCode {
  CLOSE_REQUESTED = 1000,
  UNKNOWN_ERROR = 4000,
  UNKNOWN_OP_CODE,
  DECODE_ERROR,
  NOT_AUTHENTICATED,
  AUTHENTICATION_FAILED,
  ALREADY_AUTHENTICATED,
  INVALID_SEQ = 4007,
  RATE_LIMITED,
  SESSION_TIMED_OUT,
  INVALID_SHARD,
  SHARDING_REQUIRED,
  INVALID_API_VERSION,
  INVALID_INTENTS,
  DISALLOWED_INTENTS,
}

export const closeReasons = {
  [GatewayCloseCode.CLOSE_REQUESTED]: "A websocket close was requested by the server.",
  [GatewayCloseCode.UNKNOWN_ERROR]: "Gateway isn't sure what went wrong.",
  [GatewayCloseCode.UNKNOWN_OP_CODE]: "We sent an invalid Gateway opcode or an invalid payload for an opcode. Report this to the developers.",
  [GatewayCloseCode.DECODE_ERROR]: "We sent an invalid payload, report this to the developers.",
  [GatewayCloseCode.NOT_AUTHENTICATED]: "We sent a payload before identifying this session, report this to the developers.",
  [GatewayCloseCode.AUTHENTICATION_FAILED]: "The bot token sent with the identify payload was incorrect.",
  [GatewayCloseCode.ALREADY_AUTHENTICATED]: "We sent more than one identify payload, report this to the developers.",
  [GatewayCloseCode.INVALID_SEQ]: "The sequence sent when resuming this session was invalid.",
  [GatewayCloseCode.RATE_LIMITED]: "Woah nelly! We're sending payloads too quickly, report this to the developers.",
  [GatewayCloseCode.SESSION_TIMED_OUT]: "Our session has timed out.",
  [GatewayCloseCode.INVALID_SHARD]: "We sent an invalid shard when identifying. Report this to the developers.",
  [GatewayCloseCode.SHARDING_REQUIRED]: "This session would have handled too many guilds - you are required to shard in order to connect.",
  [GatewayCloseCode.INVALID_API_VERSION]: "We sent an invalid version for the gateway.",
  [GatewayCloseCode.INVALID_INTENTS]: "We sent an invalid intent, report this to the developers.",
  [GatewayCloseCode.DISALLOWED_INTENTS]: "You specified a disallowed intent, try enabling it in your bot's application panel."
};

export enum Status {
  IDLE = "idle",
  DISCONNECTED = "disconnected",
  AWAITING_GUILDS = "awaitingGuilds",
  READY = "ready",
  RECONNECTING = "reconnecting",
  RESUMING = "resuming"
}

export enum ShardManagerEvent {
  READY = "ready",
  DEBUG = "debug",
  SHARD_ERROR = "shardError"
}

export type GatewayVersion = 8 | 7 | 6;


