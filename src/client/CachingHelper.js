/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

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
]

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
     * The caching limits.
     * @type {Map<string, number>}
     */
    this.limits = limits;
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
 * @property {Map<string, number>} [limits=Infinity]
 * @property {number} [messageSweepInterval]
 * @property {number} [messageLifetime]
 */
