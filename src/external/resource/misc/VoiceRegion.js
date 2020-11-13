/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { flatten } from "@neocord/utils";

export class VoiceRegion {
  /**
   * @param {Object} data The voice region data.
   */
  constructor(data) {
    /**
     * Unique ID for the region.
     * @type {string}
     */
    this.id = data.id;

    /**
     * Name of the region.
     * @type {string}
     */
    this.name = data.name;

    /**
     * True if this is a vip-only server.
     * @type {boolean}
     */
    this.vip = data.vip;

    /**
     * True for a single server that is closest to the current user's client.
     * @type {boolean}
     */
    this.optimal = data.optimal;

    /**
     * Whether this is a deprecated voice region (avoid switching to these).
     * @type {boolean}
     */
    this.deprecated = data.deprecated;

    /**
     * Whether this is a custom voice region (used for events/etc).
     * @type {boolean}
     */
    this.custom = data.custom;
  }

  /**
   * Get the json representation of this voice region.
   * @returns {Object}
   */
  toJSON() {
    return flatten(this);
  }
}