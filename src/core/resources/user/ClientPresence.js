/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { GatewayOp } from "../../../gateway";
import { ActivityType } from "../constants";
import { array, BitField as ActivityFlags, exclude } from "../../../common";

export class ClientPresence {
  /**
   * The client instance.
   *
   * @type {Client}
   */
  client;

  /**
   * @param {Client} client The client instance.
   */
  constructor(client) {
    Reflect.defineProperty(this, "client", {
      value: client,
      writable: false
    });
  }

  /**
   * Updates the Client User's presence.
   *
   * @param {PresenceData} data The presence data.
   * @param {number | number[]} [shards] The shards that will be updated with the provided presence.
   *
   * @returns {ClientPresence}
   */
  set(data, shards) {
    const packet = this._parse(data);
    if (shards) {
      this.client.gateway.broadcastCommand(GatewayOp.PRESENCE_UPDATE, packet);
      return this;
    }

    for (const shardId of array(shards)) {
      const shard = this.client.gateway.shards.get(shardId);
      if (!shard) {
        continue;
      }

      shard.sendCommand({ op: GatewayOp.PRESENCE_UPDATE, d: packet });
    }

    return this;
  }

  /**
   * Parses presence data into usable packet data.
   *
   * @param {PresenceData} data The presence data.
   *
   * @private
   */
  _parse({ since, afk, activities, status }) {
    const packet = {
      since: since ?? null,
      afk: afk ?? false,
      status: status ?? this.status
    };

    if (activities && activities[0]) {
      const activity = activities[0];
      if (activity.type && !ActivityType[activity.type]) {
        throw new TypeError(`Activity type "${activity.type}" does not exist.`);
      }

      if (!activity.type) {
        activity.type = 0;
      }

      const game = {
        ...exclude(activity, "createdAt", "applicationId", "assets", "flags"),
        created_at: activity.createdAt,
        application_id: activity.applicationId,
        assets: activity.assets ? {
          large_image: activity.assets.largeImage,
          large_text: activity.assets.largeText,
          small_image: activity.assets.smallImage,
          small_text: activity.assets.smallText
        } : undefined
      };

      if (activity.flags) {
        game.flags = ActivityFlags.resolve(activity.flags);
      }

      packet.activities = [ game ];
    } else {
      packet.activities = null;
    }

    return packet;
  }
}

/**
 * @typedef {Object} PresenceData
 * @prop {number} [since] Unix time (in milliseconds) of when the client went idle, or null if the client is not idle
 * @prop {StatusType} [status] The user's new status.
 * @prop {boolean} [afk] Whether or not the client is afk
 * @prop {ActivityData[]} [activities] The user's activities.
 */

/**
 * @typedef {Object} ActivityData
 * @prop {string} [name] Name of the activity.
 * @prop {ActivityType | number} [type] Type of the activity.
 * @prop {string} [url] Twitch or YouTube stream URL.
 * @prop {string} [name] Name of the activity.
 * @prop {number | Date} [createdAt] Unix timestamp of when the activity was added to the user's session.
 * @prop {ActivityTimestamps} [timestamps] Unix timestamps for start and/or end of the game.
 * @prop {snowflake} [applicationId] Application id for the game.
 * @prop {string} [details] What the player is currently doing.
 * @prop {string} [state] The user's current party status.
 * @prop {Emoji} [emoji] The emoji used for a custom status.
 * @prop {ActivityParty} [party] Information for the current party of the player.
 * @prop {ActivityAssets} [assets] Images for the presence and their hover texts.
 * @prop {ActivitySecrets} [secrets] Secrets for Rich Presence joining and spectating.
 * @prop {boolean} [activity] Whether or not the activity is an instanced game session.
 * @prop {ActivityFlags | number} [flags] Activity flags, describes what the payload includes.
 */

/**
 * @typedef {Object} ActivityTimestamps
 * @prop {number} [start] Unix time (in milliseconds) of when the activity started.
 * @prop {number} [end] Unix time (in milliseconds) of when the activity ends.
 */

/**
 * @typedef {Object} ActivityParty
 * @prop {string} [id] The id of the party.
 * @prop {[number, number]} Used to show the party's current and maximum size.
 */

/**
 * @typedef {Object} ActivityAssets
 * @prop {string} [largeImage] The id for a large asset of the activity, usually a snowflake.
 * @prop {string} [largeText] Text displayed when hovering over the large image of the activity.
 * @prop {string} [smallImage] The id for a small asset of the activity, usually a snowflake.
 * @prop {string} [smallText] Text displayed when hovering over the small image of the activity.
 */

/**
 * @typedef {Object} ActivitySecrets
 * @prop {string} [join] The secret for joining a party.
 * @prop {string} [spectate] The secret for spectating a game.
 * @prop {string} [match] The secret for a specific instanced match.
 */

/**
 * @typedef {"online" | "dnd" | "idle" | "invisible" | "offline"} StatusType
 */

