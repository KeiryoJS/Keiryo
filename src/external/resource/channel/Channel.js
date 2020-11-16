/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../../abstract/Resource";
import { ChannelTypes } from "../../../utils/Constants";

import { Snowflake } from "@neocord/utils";

export class Channel extends Resource {
  /**
   * Represents any channel on Discord
   * @param {Client} client
   * @param {Object} data
   */
  constructor(client, data) {
    super(client);

    /**
     * The ID of the channel
     * @type {string}
     */
    this.id = data.id;

    /**
     * The type of the channel
     * * `dm` - a DM channel
     * * `text` - a guild text channel
     * * `voice` - a guild voice channel
     * * `category` - a guild category channel
     * * `news` - a guild news channel
     * * `store` - a guild store channel
     * * `unknown` - a generic channel of unknown type
     * @type {string}
     */
    this.type = ChannelTypes[data.type]?.toLowerCase() ?? "unknown";
  }

  /**
   * The timestamp the channel was created
   * @type {number}
   * @readonly
   */
  get createdTimestamp() {
    return Snowflake.deconstruct(this.id).timestamp;
  }

  /**
   * The time the channel was created
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  /**
   * The mention string for this channel
   * @type {string}
   */
  get mention() {
    return `<#${this.id}>`;
  }

  /**
   * The string representation of this channel
   * @returns {string}
   */
  toString() {
    return this.mention;
  }

  /**
   * Delete this channel
   * @returns {Promise<Channel>}
   */
  async delete() {
    await this.client.rest.delete(`/channels/${this.id}`);
    return this;
  }
}
