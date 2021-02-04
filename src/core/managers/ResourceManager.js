/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

export class ResourceManager {
  #cache
  /**
   * The client instance.
   *
   * @type {Client}
   */
  #client;

  /**
   * The class to instantiate.
   *
   * @type {typeof Resource}
   */
  #class;

  /**
   * @param {Client} client The client instance.
   */
  constructor(client, { class: clazz }) {
    this.#client = client;
    this.#class = clazz;
  }

  /**
   * The client instance.
   *
   * @type {Client}
   */
  get client() {
    return this.#client;
  }

  /**
   * Adds a new Resource to the cache and returns the instantiated class.
   *
   * @param {Object} resource The resource from Discord.
   * @param {boolean} cache Whether to cache the provided resource,
   *
   * @returns {Resource}
   */
  add(resource, cache = true) {
    const instantiated = new this.#class(this.client, resource);
    if (cache) {
      // todo: call a method to cache the resource
    }

    return instantiated;
  }


}

/**
 * @typedef {Object} FetchOptions
 * @property {boolean} [force] Whether to skip the cache check.
 * @property {boolean} [cache] Whether to cache the fetched resource.
 */
