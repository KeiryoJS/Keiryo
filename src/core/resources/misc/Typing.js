/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../Resource";

export class Typing extends Resource {
  /**
   * @param {Client} client The client instance.
   * @param {Object} data The typing data.
   */
  constructor(client, data) {
    super(client);

    this._patch(data);
  }

  /**
   * Fetches the channel from cache and returns it.
   *
   * @param {CacheFetchOptions} [options] Options to use while fetching from the cache.
   *
   * @returns {Promise<TextableGuildChannel>}
   */
  async getChannel(options) {
    if (this.guildId) {
      const guild = await this.getGuild();
      return guild.channels.get(this.channelId, options);
    }

    return this.client.channels.get(this.channelId, options);
  }

  /**
   * Fetches the guild from cache and returns it.
   *
   * @param {CacheFetchOptions} [options] Options to use while fetching from the cache.
   *
   * @returns {Promise<Guild | null>}
   */
  async getGuild(options) {
    return this.guildId ? null : void 0; // todo: get guild via cache.
  }

  /**
   * Fetches the User via cache.
   *
   * @param {CacheFetchOptions} [options] Options to use while fetching the user.
   *
   * @returns {Promise<User>}
   */
  async getUser(options) {
    return await this.client.users.get(this.userId, options);
  }

  /**
   * Fetches the Member via cache.
   *
   * @param {CacheFetchOptions} [options] The options to use.
   *
   * @returns {Promise<GuildMember | null>}
   */
  async getMember(options) {
    if (this.guildId) {
      const guild = await this.getGuild();
      return guild.members.get(this.userId, options);
    }

    return null;
  }

  /**
   * Updates this Typing with data from the Discord API.
   *
   * @param {Object} data
   */
  _patch(data) {
    /**
     * ID of the Channel.
     *
     * @type {string}
     */
    this.channelId = data.channel_id;

    /**
     * ID of the Guild this typing occurred in.
     *
     * @type {string | null}
     */
    this.guildId = data.guild_id ?? null;

    /**
     * The ID of the user who started typing.
     *
     * @type {string}
     */
    this.userId = data.user_id;

    /**
     * When the user started typing.
     *
     * @type {number}
     */
    this.startedTimestamp = data.timestamp;

    return this;
  }
}
