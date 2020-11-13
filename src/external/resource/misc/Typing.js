/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

export class Typing {
  /**
   * @param {Client} client The client instance.
   * @param {Object} data The typing data.
   */
  constructor(client, data) {
    /**
     * The client instance.
     * @type {Client}
     */
    this.client = client;

    /**
     * The channel that the user is typing in.
     * @type {string}
     */
    this.channelId = data.channel_id;

    /**
     * The guild that the user is typing in.
     * @type {string}
     */
    this.guildId = data.guildId;

    /**
     * The user that is typing.
     * @type {string}
     */
    this.userId = data.userId;

    /**
     * When the user started typing.
     * @type {number}
     */
    this.startedTimestamp = data.timestamp;
  }
}