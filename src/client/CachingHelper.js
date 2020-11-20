/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { PartialResource } from "../utils/Constants";

const resources = [
  "user",
  "guild",
  "presence",
  "permissionOverwrite",
  "role",
  "relationship",
  "channel",
  "guildChannel",
  "note",
  "voiceState",
  "guildMember",
  "message",
  "integration",
  "template",
  "invite",
  "emoji"
];

export class CachingHelper {
  /**
   * @param {CachingOptions} options The options for caching.
   */
  constructor(options = {}) {
    let limits = new Map();
    if (typeof options.limits === "number") {
      for (const resource of resources) {
        limits.set(resource, options.limits);
      }
    } else if (options.limits instanceof Map) {
      limits = options.limits;
    }

    /**
     * Resources that are allowed to be partial.
     * @type {PartialResource[]}
     */
    this.partials = (options.partials ?? []).filter(p => !PartialResource[p]) ?? [];

    /**
     * The caching limits.
     * @type {Map<string, number>}
     */
    this.limits = limits;
  }

  /**
   * Check whether a resource is allowed to be partial
   * @param {PartialResource | string} type The resource name or partial type.
   * @return {boolean}
   */
  cbp(type) {
    if (!PartialResource[type]) {
      return false;
    }

    return this.partials.includes(type);
  }

  /**
   * Get the limit for a resource type.
   * @param {string} resource
   * @return {number}
   */
  limitFor(resource) {
    return this.limits.get(resource) ?? Infinity;
  }
}

/**
 * @typedef {Object} CachingOptions
 * @prop {Map<string, number>} [limits=Infinity]
 * @prop {number} [messageSweepInterval]
 * @prop {number} [messageLifetime]
 * @prop {(PartialResource | string)[]} [partials] Resources that are allowed to be partial.
 */
