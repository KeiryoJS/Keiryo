/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Resource } from "../Resource";

/**
 * Represents a Discord VoiceRegion.
 */
export class VoiceRegion extends Resource {
  /**
   * @param {Client} client The client instance.
   * @param {Object} data The voice region data.
   */
  constructor(client, data) {
    super(client)

    this._patch(data);
  }

  /**
   * Updates this VoiceRegion with data from the Discord API.
   *
   * @param {Object} data
   *
   * @private
   */
  _patch(data) {
    /**
     * The Unique ID for this region.
     *
     * @type {string}
     */
    this.id = data.id;

    /**
     * The name of this region.
     *
     * @type {string}
     */
    this.name = data.name;

    /**
     * True if this is a VIP-only server.
     *
     * @type {boolean}
     */
    this.vip = data.vip;

    /**
     * True for a single server that is closest to the current user's client.
     *
     * @type {boolean}
     */
    this.optimal = data.optimal;

    /**
     * Whether this is a deprecated voice region.
     * Avoid switching to these.
     *
     * @type {boolean}
     */
    this.deprecated = data.deprecated;

    /**
     * Whether this is a custom voice region.
     * @type {boolean}
     */
    this.custom = data.custom;

    return this;
  }
}