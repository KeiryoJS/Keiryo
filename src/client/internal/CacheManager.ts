/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { ResourceType, resourceTypes } from "../../external/abstract/ResourceType";
import { Cache } from "./Cache";

import type { Client } from "../Client";
import type { Resource } from "../../external/abstract/Resource";

export class CacheManager {

  /**
   * The amount of resources that can be cached at one point in time.
   *
   * @type {Map<ResourceType, number>}
   */
  public limits: Map<ResourceType, number>;

  /**
   * The types of resources that wont be cached.
   *
   * @type {Set<ResourceType>}
   */
  public disabled: Set<ResourceType>;

  /**
   * The client instance.
   *
   * @type {Client}
   * @private
   */
  readonly #client: Client;

  /**
   * @param {Client} client The client instance.
   * @param {CacheOptions} options Options for this cache manager.
   */
  public constructor(client: Client, options: CacheOptions = {}) {
    this.#client = client;

    this.disabled = new Set(options.disabled);
    if (typeof options.limits === "number") {
      this.limits = new Map();
      for (const type of resourceTypes) {
        if (this.disabled.has(type)) {
          continue;
        }

        this.limits.set(type, options.limits);
      }
    } else {
      this.limits = new Map(options.limits ?? []);
    }
  }

  /**
   * The client instance.
   *
   * @type {Client}
   */
  public get client(): Client {
    return this.#client;
  }

  /**
   * Get a limit for a certain resource type.
   * @param {ResourceType} type The type of resource.
   *
   * @returns {number}
   */
  public limitFor(type: ResourceType): number {
    if (this.disabled.has(type)) {
      return 0;
    }

    return this.limits.get(type) ?? Infinity;
  }

  /**
   * Check whether a certain type of resource is disabled.
   * @param {ResourceType} type The type of resource.
   *
   * @returns {boolean}
   */
  public isDisabled(type: ResourceType): boolean {
    return Boolean(this.limitFor(type));
  }

  /**
   * Get a cache for a certain resource type.
   * @param {ResourceType} type The type of resource.
   *
   * @returns {Cache}
   */
  public getCache<R extends Resource>(type: ResourceType): Cache<R> {
    return new Cache([], {
      resource: type,
      limit: this.limitFor(type)
    });
  }
}

export interface CacheOptions {
  limits?: Map<ResourceType, number> | number;
  disabled?: Set<ResourceType>;
}
