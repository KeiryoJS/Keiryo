/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { flatten } from "@neocord/utils";

import type { APIVoiceRegion } from "discord-api-types";

export class VoiceRegion {
  /**
   * Unique ID for the region.
   * @type {string}
   */
  public readonly id: string;

  /**
   * Name of the region.
   * @type {string}
   */
  public readonly name: string;

  /**
   * True if this is a vip-only server.
   * @type {boolean}
   */
  public readonly vip: boolean;

  /**
   * True for a single server that is closest to the current user's client.
   * @type {boolean}
   */
  public readonly optimal: boolean;

  /**
   * Whether this is a deprecated voice region (avoid switching to these).
   */
  public readonly deprecated: boolean;

  /**
   * Whether this is a custom voice region (used for events/etc).
   * @type {boolean}
   */
  public readonly custom: boolean;

  /**
   * @param {APIVoiceRegion} data The voice region data from discord.
   */
  public constructor(data: APIVoiceRegion) {
    this.id = data.id;
    this.name = data.name;
    this.vip = data.vip;
    this.optimal = data.optimal;
    this.deprecated = data.deprecated;
    this.custom = data.custom;
  }

  /**
   * Get the json representation of this voice region.
   * @returns {APIVoiceRegion}
   */
  public toJSON(): APIVoiceRegion {
    return flatten(this);
  }
}
