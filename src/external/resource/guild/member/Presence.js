/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../../../abstract/Resource";
import { ActivityFlags } from "../../../../utils";
import { Emoji } from "../../emoji/Emoji";

export class Presence extends Resource {
  /**
   * @param {Client} client The client instance.
   * @param {Object} data The presence data.
   */
  constructor(client, data) {
    super(client);

    /**
     * The ID of the member this presence belongs to.
     * @type {?string}
     */
    this.userId = data.user.id;

    /**
     * The guild that this presence belongs to.
     * @type {?string}
     */
    this.guildId = data.guild_id;

    this._patch(data);
  }

  /**
   * The ID of this presence.
   * @return {?string}
   */
  get id() {
    return this.userId;
  }

  /**
   * The user of this presence.
   * @type {?User}
   * @readonly
   */
  get user() {
    return (this.userId && this.client.users.get(this.userId)) ?? null;
  }

  /**
   * The guild of this presence.
   * @return {*|null}
   */
  get guild() {
    return (this.guildId && this.client.guilds.get(this.guildId)) ?? null;
  }

  /**
   * The member of this presence.
   * @type {?GuildMember}
   * @readonly
   */
  get member() {
    return (this.guildId && this.guild.members.get(this.userId)) ?? null;
  }

  /**
   * Updates this presence with data from Discord.
   * @param data
   * @return {Presence}
   * @private
   */
  _patch(data) {
    /**
     * The status of this presence.
     * @type {string}
     */
    this.status = data.status ?? this.status ?? "offline";

    /**
     * The devices this presence is for.
     * @type {?Object}
     */
    this.clients = data.client_status ?? null;

    if (data.activities) {
      /**
       * The activities of this presence.
       * @type {Activity[]}
       */
      this.activities = data.activities.map(activity => new Activity(this, activity));
    } else {
      this.activities = [];
    }

    return this;
  }
}

export class Activity {
  /**
   * @param {Presence} presence The presence this activity belongs to.
   * @param {Object} data The activity data.
   */
  constructor(presence, data) {
    /**
     * The presence that this activity belongs to.
     * @type {Presence}
     * @readonly
     */
    Object.defineProperty(this, "presence", {
      value: presence
    });

    /**
     * The ID of this activity.
     * @type {string}
     */
    this.id = data.id;

    /**
     * The name of the activity.
     * @type {string}
     */
    this.name = data.name;

    /**
     * Details about the activity.
     * @type {?string}
     */
    this.details = data.details ?? null;

    /**
     * The application ID associated with this activity.
     * @type {?string}
     */
    this.applicationId = data.application_id ?? null;

    /**
     * State of the activity.
     * @type {?string}
     */
    this.state = data.state ?? null;

    /*
     * The type of activity being played.
     * @type {ActivityType}
     */
    this.type = data.type;

    /**
     * Timestamps for the activity
     * @type {?Object}
     */
    this.timestamps = data.timestamps
      ? {
        start: data.timestamps.start ? new Date(Number(data.timestamps.start)) : null,
        end: data.timestamps.end ? new Date(Number(data.timestamps.end)) : null
      }
      : null;

    /**
     * If the activity is being streamed, a link to the stream will be present.
     * @type {?string}
     */
    this.url = data.url ?? null;

    /**
     * Flags that describe the activity
     * @type {ActivityFlags}
     */
    this.flags = new ActivityFlags(data.flags).freeze();

    /**
     * Activity start time.
     * @type {?number}
     */
    this.createdTimestamp = data.created_at
      ? new Date(data.created_at).getTime()
      : null;

    /**
     * The custom status emoji.
     * @type {?Emoji}
     */
    this.emoji = data.emoji ? new Emoji(presence.client, data.emoji) : null;
  }

  /**
   * The time the activity was started.
   * @type {?Date}
   */
  get createdAt() {
    return this.createdTimestamp ? new Date(this.createdTimestamp) : null;
  }

  /**
   * The string representation of this activity.
   * @return {string}
   */
  toString() {
    return this.name;
  }
}
