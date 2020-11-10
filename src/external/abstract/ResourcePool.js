/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Collection } from "@neocord/utils";

export class ResourcePool extends Collection {
  static [Symbol.species] = Collection;

  /**
   * @param {Client} client The client.
   * @param {ResourcePoolData} data The resource pool data.
   */
  constructor(client, data) {
    super();

    /**
     * The client instance.
     * @type {Client}
     */
    this.client = client;

    /**
     * The total number of items this pool can hold.
     * @type {number}
     */
    this.limit = data.limit;

    /**
     * The class to create.
     * @type {*}
     */
    this.class = data.class;
  }

  /**
   * Tries to resolve something into a cached resource.
   * @param {ResourceLike} resl The value to resolve.
   * @returns {?Resource}
   */
  resolve(resl) {
    if (this._matches(resl)) {
      return resl;
    }

    const id = this.resolveId(resl);
    if (!id) {
      return null;
    }

    return this.get(id) ?? null;
  }

  /**
   * Tries to resolve something into an id.
   * @param {ResourceLike} resl The value to resolve.
   * @returns {string | null}
   */
  resolveId(resl) {
    if (typeof resl === "string") {
      return resl.id;
    }

    return this._matches(resl) || typeof resl.id === "string"
      ? resl.id
      : null;
  }

  /**
   * Creates a new resource with some data.
   * @param {Object} data The data to use.
   * @param {...*} args Arguments that will be passed to the constructor.
   * @returns {Resource}
   */
  add(data, ...args) {
    if (!this.limit) {
      return this._matches(data) ? data : this._create(data, ...args);
    }

    const existing = this.get(data.id);
    if (existing) {
      return existing._patch(data, ...args);
    }

    if (!this._matches(data)) {
      data = this._set(this._create(data, ...args));
    }

    return data;
  }

  /**
   * The JSON representation of this resource pool.
   */
  toJSON() {
    return [ ...this.keys() ];
  }

  /**
   * Whether something matches the class this pool handles.
   * @param {any} object The object.
   * @returns {boolean}
   */
  _matches(object) {
    return object instanceof this.class || object.constructor.name === this.class.name;
  }

  /**
   * Adds an item to this pool.
   * @param {Resource} resource The resource.
   * @returns {Resource}
   */
  _set(resource) {
    this.set(resource.id, resource);
    if (this.limit && this.size > this.limit) {
      const keys = [ ...this.keys() ];
      while (this.size > this.limit) {
        this.delete(keys.shift());
      }
    }

    return resource;
  }

  /**
   * Creates a new resource.
   * @param {Object} data The starting data.
   * @param {...*} args Arguments that will be passed to the constructor.
   * @return {Resource}
   */
  _create(data, ...args) {
    return new this.class(this.client, data, ...args);
  }
}

/**
 * @typedef {Object} ResourcePoolData
 * @property {*} class
 * @property {number} limit
 */

/**
 * @typedef {Resource | string | { id: string }} ResourceLike
 */
