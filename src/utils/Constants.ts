/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

export enum Status {
  WAITING_FOR_GUILDS,
  IDENTIFYING,
  RESUMING,
  READY,
  IDLE,
  DISCONNECTED,
  HANDSHAKING,
  CONNECTING,
  RECONNECTING,
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

export enum ImageFormats {
  WEBP = "image/webp",
  GIF = "image/gif",
  PNG = "image/png",
  JPEG = "image/jpeg",
}

export enum ClientEvent {
  SHARD_RESUMED = "shardResumed",
  GUILD_AVAILABLE = "guildAvailable",
  GUILD_UNAVAILABLE = "guildUnavailable",
  ROLE_CREATE = "roleCreate",
  ROLE_DELETE = "roleDelete",
  ROLE_UPDATE = "roleUpdate",
  READY = "ready",
  SHARD_ERROR = "shardError",
  SHARD_READY = "shardReady",
  SHARD_DISCONNECT = "shardDisconnected",
  RAW_PACKET = "raw",
  SHARD_RECONNECTING = "shardReconnecting",
  INVALIDATED = "invalidated",
  DEBUG = "debug",
  LIMITED = "rate-limited",
}

export enum ChannelTypes {
  TEXT = 0,
  DM = 1,
  VOICE = 2,
  GROUP = 3,
  CATEGORY = 4,
  NEWS = 5,
  STORE = 6,
}

export enum ShardEvent {
  ERROR = "error",
  CLOSE = "close",
  READY = "ready",
  RESUMED = "resumed",
  INVALID_SESSION = "invalidSession",
  DESTROYED = "destroyed",
  FULL_READY = "fullReady",
}

export enum GatewayOp {
  DISPATCH,
  HEARTBEAT,
  IDENTIFY,
  PRESENCE_UPDATE,
  VOICE_STATE_UPDATE,
  RESUME = 6,
  RECONNECT,
  REQUEST_GUILD_MEMBERS,
  INVALID_SESSION,
  HELLO,
  HEARTBEAT_ACK,
}

/**
 * @typedef {Object} RelationshipType
 * @property {number} FRIEND
 * @property {number} BLOCK
 * @property {number} INCOMING_FRIEND_REQUEST
 * @property {number} OUTGOING_FRIEND_REQUEST
 */
export enum RelationshipType {
  FRIEND,
  BLOCK,
  INCOMING_FRIEND_REQUEST,
  OUTGOING_FRIEND_REQUEST,
}

export const IMAGE_SIZES = Array.from({ length: 9 }, (_e, i) => 2 ** (i + 4));

export const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "gif"];
